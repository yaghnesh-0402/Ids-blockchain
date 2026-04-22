import argparse
import json
import math
import statistics
import sys
import time
from collections import defaultdict

from scapy.all import IP, TCP, UDP, Raw, sniff


ACTIVE_GAP_SECONDS = 1.0


def now_status(packet_count):
    sys.stdout.write(json.dumps({"type": "status", "packetsSeen": packet_count}) + "\n")
    sys.stdout.flush()


def packet_direction(packet, flow_key):
    src, sport, dst, dport, protocol = flow_key
    packet_src = packet[IP].src
    packet_dst = packet[IP].dst
    packet_sport = int(getattr(packet.payload, "sport", 0) or 0)
    packet_dport = int(getattr(packet.payload, "dport", 0) or 0)
    if packet_src == src and packet_dst == dst and packet_sport == sport and packet_dport == dport:
      return "fwd"
    return "bwd"


def canonical_flow_key(packet):
    if IP not in packet:
        return None

    protocol = "OTHER"
    sport = 0
    dport = 0

    if TCP in packet:
        protocol = "TCP"
        sport = int(packet[TCP].sport)
        dport = int(packet[TCP].dport)
    elif UDP in packet:
        protocol = "UDP"
        sport = int(packet[UDP].sport)
        dport = int(packet[UDP].dport)

    src = packet[IP].src
    dst = packet[IP].dst
    a = (src, sport)
    b = (dst, dport)
    if a <= b:
        return src, sport, dst, dport, protocol
    return dst, dport, src, sport, protocol


def create_flow_summary(flow_key):
    src, sport, dst, dport, protocol = flow_key
    return {
        "flow": {
            "src": src,
            "sport": sport,
            "dst": dst,
            "dport": dport,
            "protocol": protocol,
        },
        "all_packets": [],
        "fwd_packets": [],
        "bwd_packets": [],
        "all_times": [],
        "fwd_times": [],
        "bwd_times": [],
        "flags": defaultdict(int),
        "fwd_flags": defaultdict(int),
        "bwd_flags": defaultdict(int),
        "first_seen": None,
        "last_seen": None,
        "init_win_forward": 0,
        "init_win_backward": 0,
        "act_data_pkt_fwd": 0,
        "fwd_header_lengths": [],
        "bwd_header_lengths": [],
        "fwd_segment_sizes": [],
        "bwd_segment_sizes": [],
        "packet_preview": [],
    }


def std(values):
    return statistics.pstdev(values) if len(values) > 1 else 0.0


def mean(values):
    return statistics.fmean(values) if values else 0.0


def safe_rate(total, duration_microseconds):
    duration_seconds = duration_microseconds / 1_000_000 if duration_microseconds else 0
    if duration_seconds <= 0:
        return 0.0
    return total / duration_seconds


def inter_arrival(times):
    if len(times) < 2:
        return []
    return [times[index] - times[index - 1] for index in range(1, len(times))]


def active_idle_periods(times):
    if len(times) < 2:
        return [], []

    active = []
    idle = []
    segment_start = times[0]
    previous = times[0]

    for current in times[1:]:
        gap_seconds = (current - previous) / 1_000_000
        if gap_seconds > ACTIVE_GAP_SECONDS:
            active.append(previous - segment_start)
            idle.append(current - previous)
            segment_start = current
        previous = current

    active.append(previous - segment_start)
    return active, idle


def update_flags(summary, direction, packet):
    if TCP not in packet:
        return

    tcp = packet[TCP]
    for flag_name, flag_mask in [
        ("FIN", 0x01),
        ("SYN", 0x02),
        ("RST", 0x04),
        ("PSH", 0x08),
        ("ACK", 0x10),
        ("URG", 0x20),
        ("ECE", 0x40),
        ("CWE", 0x80),
    ]:
        if int(tcp.flags) & flag_mask:
            summary["flags"][flag_name] += 1
            if direction == "fwd":
                summary["fwd_flags"][flag_name] += 1
            else:
                summary["bwd_flags"][flag_name] += 1


def header_length(packet):
    total = 0
    if IP in packet:
        total += int(packet[IP].ihl or 0) * 4
    if TCP in packet:
        total += int(packet[TCP].dataofs or 0) * 4
    elif UDP in packet:
        total += 8
    return total


def segment_size(packet):
    if TCP in packet:
        return int(packet[TCP].dataofs or 0) * 4
    if UDP in packet:
        return 8
    return 0


def payload_length(packet):
    if Raw in packet:
        return len(bytes(packet[Raw]))
    return 0


def feed_packet(summary, flow_key, packet):
    packet_time = int(float(packet.time) * 1_000_000)
    direction = packet_direction(packet, flow_key)
    packet_len = int(len(packet))
    header_len = header_length(packet)
    segment_len = segment_size(packet)

    if summary["first_seen"] is None:
        summary["first_seen"] = packet_time
    summary["last_seen"] = packet_time

    summary["all_packets"].append(packet_len)
    summary["all_times"].append(packet_time)

    if direction == "fwd":
        summary["fwd_packets"].append(packet_len)
        summary["fwd_times"].append(packet_time)
        summary["fwd_header_lengths"].append(header_len)
        summary["fwd_segment_sizes"].append(segment_len)
        if TCP in packet and not summary["init_win_forward"]:
            summary["init_win_forward"] = int(packet[TCP].window)
        if payload_length(packet) > 0:
            summary["act_data_pkt_fwd"] += 1
    else:
        summary["bwd_packets"].append(packet_len)
        summary["bwd_times"].append(packet_time)
        summary["bwd_header_lengths"].append(header_len)
        summary["bwd_segment_sizes"].append(segment_len)
        if TCP in packet and not summary["init_win_backward"]:
            summary["init_win_backward"] = int(packet[TCP].window)

    update_flags(summary, direction, packet)

    if len(summary["packet_preview"]) < 5:
        summary["packet_preview"].append(
            {
                "timestamp": packet_time,
                "src": packet[IP].src,
                "dst": packet[IP].dst,
                "length": packet_len,
                "direction": direction,
                "protocol": flow_key[4],
            }
        )


def feature_payload(summary):
    total_fwd_packets = len(summary["fwd_packets"])
    total_bwd_packets = len(summary["bwd_packets"])
    total_length_fwd = sum(summary["fwd_packets"])
    total_length_bwd = sum(summary["bwd_packets"])
    all_iat = inter_arrival(summary["all_times"])
    fwd_iat = inter_arrival(summary["fwd_times"])
    bwd_iat = inter_arrival(summary["bwd_times"])
    active_periods, idle_periods = active_idle_periods(summary["all_times"])
    flow_duration = max(0, (summary["last_seen"] or 0) - (summary["first_seen"] or 0))
    min_seg_size_forward = min(summary["fwd_segment_sizes"]) if summary["fwd_segment_sizes"] else 0

    return {
        "Flow Duration": flow_duration,
        "Total Fwd Packets": total_fwd_packets,
        "Total Backward Packets": total_bwd_packets,
        "Total Length of Fwd Packets": total_length_fwd,
        "Total Length of Bwd Packets": total_length_bwd,
        "Fwd Packet Length Max": max(summary["fwd_packets"]) if summary["fwd_packets"] else 0,
        "Fwd Packet Length Min": min(summary["fwd_packets"]) if summary["fwd_packets"] else 0,
        "Fwd Packet Length Mean": mean(summary["fwd_packets"]),
        "Fwd Packet Length Std": std(summary["fwd_packets"]),
        "Bwd Packet Length Max": max(summary["bwd_packets"]) if summary["bwd_packets"] else 0,
        "Bwd Packet Length Min": min(summary["bwd_packets"]) if summary["bwd_packets"] else 0,
        "Bwd Packet Length Mean": mean(summary["bwd_packets"]),
        "Bwd Packet Length Std": std(summary["bwd_packets"]),
        "Flow Bytes/s": safe_rate(total_length_fwd + total_length_bwd, flow_duration),
        "Flow Packets/s": safe_rate(total_fwd_packets + total_bwd_packets, flow_duration),
        "Flow IAT Mean": mean(all_iat),
        "Flow IAT Std": std(all_iat),
        "Flow IAT Max": max(all_iat) if all_iat else 0,
        "Flow IAT Min": min(all_iat) if all_iat else 0,
        "Fwd IAT Total": sum(fwd_iat),
        "Fwd IAT Mean": mean(fwd_iat),
        "Fwd IAT Std": std(fwd_iat),
        "Fwd IAT Max": max(fwd_iat) if fwd_iat else 0,
        "Fwd IAT Min": min(fwd_iat) if fwd_iat else 0,
        "Bwd IAT Total": sum(bwd_iat),
        "Bwd IAT Mean": mean(bwd_iat),
        "Bwd IAT Std": std(bwd_iat),
        "Bwd IAT Max": max(bwd_iat) if bwd_iat else 0,
        "Bwd IAT Min": min(bwd_iat) if bwd_iat else 0,
        "Fwd PSH Flags": summary["fwd_flags"]["PSH"],
        "Bwd PSH Flags": summary["bwd_flags"]["PSH"],
        "Fwd URG Flags": summary["fwd_flags"]["URG"],
        "Bwd URG Flags": summary["bwd_flags"]["URG"],
        "Fwd Header Length": sum(summary["fwd_header_lengths"]),
        "Bwd Header Length": sum(summary["bwd_header_lengths"]),
        "Fwd Packets/s": safe_rate(total_fwd_packets, flow_duration),
        "Bwd Packets/s": safe_rate(total_bwd_packets, flow_duration),
        "Min Packet Length": min(summary["all_packets"]) if summary["all_packets"] else 0,
        "Max Packet Length": max(summary["all_packets"]) if summary["all_packets"] else 0,
        "Packet Length Mean": mean(summary["all_packets"]),
        "Packet Length Std": std(summary["all_packets"]),
        "Packet Length Variance": statistics.pvariance(summary["all_packets"]) if len(summary["all_packets"]) > 1 else 0,
        "FIN Flag Count": summary["flags"]["FIN"],
        "SYN Flag Count": summary["flags"]["SYN"],
        "RST Flag Count": summary["flags"]["RST"],
        "PSH Flag Count": summary["flags"]["PSH"],
        "ACK Flag Count": summary["flags"]["ACK"],
        "URG Flag Count": summary["flags"]["URG"],
        "CWE Flag Count": summary["flags"]["CWE"],
        "ECE Flag Count": summary["flags"]["ECE"],
        "Down/Up Ratio": (total_bwd_packets / total_fwd_packets) if total_fwd_packets else 0,
        "Average Packet Size": mean(summary["all_packets"]),
        "Avg Fwd Segment Size": mean(summary["fwd_packets"]),
        "Avg Bwd Segment Size": mean(summary["bwd_packets"]),
        "Fwd Header Length.1": sum(summary["fwd_header_lengths"]),
        "Fwd Avg Bytes/Bulk": 0,
        "Fwd Avg Packets/Bulk": 0,
        "Fwd Avg Bulk Rate": 0,
        "Bwd Avg Bytes/Bulk": 0,
        "Bwd Avg Packets/Bulk": 0,
        "Bwd Avg Bulk Rate": 0,
        "Subflow Fwd Packets": total_fwd_packets,
        "Subflow Fwd Bytes": total_length_fwd,
        "Subflow Bwd Packets": total_bwd_packets,
        "Subflow Bwd Bytes": total_length_bwd,
        "Init_Win_bytes_forward": summary["init_win_forward"],
        "Init_Win_bytes_backward": summary["init_win_backward"],
        "act_data_pkt_fwd": summary["act_data_pkt_fwd"],
        "min_seg_size_forward": min_seg_size_forward,
        "Active Mean": mean(active_periods),
        "Active Std": std(active_periods),
        "Active Max": max(active_periods) if active_periods else 0,
        "Active Min": min(active_periods) if active_periods else 0,
        "Idle Mean": mean(idle_periods),
        "Idle Std": std(idle_periods),
        "Idle Max": max(idle_periods) if idle_periods else 0,
        "Idle Min": min(idle_periods) if idle_periods else 0,
    }


def emit_flow(flow_key, summary, packet_count, window_seconds):
    features = feature_payload(summary)
    duration_ms = round(features["Flow Duration"] / 1000, 2)
    payload = {
        "type": "flow",
        "packetsSeen": packet_count,
        "captureWindow": window_seconds,
        "flow": {
            **summary["flow"],
            "durationMs": duration_ms,
            "forwardPackets": len(summary["fwd_packets"]),
            "backwardPackets": len(summary["bwd_packets"]),
        },
        "packetPreview": summary["packet_preview"],
        "features": features,
    }
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--window-seconds", type=int, default=30)
    parser.add_argument("--interface", default="")
    parser.add_argument("--filter", default="")
    args = parser.parse_args()

    packet_count = 0

    while True:
        flows = {}

        def handle_packet(packet):
            nonlocal packet_count, flows
            if IP not in packet:
                return

            flow_key = canonical_flow_key(packet)
            if not flow_key:
                return

            if flow_key not in flows:
                flows[flow_key] = create_flow_summary(flow_key)

            packet_count += 1
            feed_packet(flows[flow_key], flow_key, packet)

        sniff(
            prn=handle_packet,
            store=False,
            timeout=args.window_seconds,
            iface=args.interface or None,
            filter=args.filter or None,
        )

        now_status(packet_count)

        for flow_key, summary in flows.items():
            emit_flow(flow_key, summary, packet_count, args.window_seconds)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
