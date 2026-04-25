from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Ellipse, FancyArrowPatch, FancyBboxPatch


OUTPUT_DIR = Path(__file__).resolve().parent


PALETTE = {
    "ink": "#17324d",
    "line": "#315b7a",
    "soft": "#eaf2f8",
    "soft_alt": "#f5f7fa",
    "accent": "#d8e8f5",
    "actor": "#eef6ff",
    "node": "#eef3f7",
}


def setup_ax(figsize=(14, 9), title=""):
    fig, ax = plt.subplots(figsize=figsize, dpi=200)
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    if title:
        ax.text(
            50,
            97,
            title,
            ha="center",
            va="center",
            fontsize=18,
            fontweight="bold",
            color=PALETTE["ink"],
        )
    return fig, ax


def save(fig, filename):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUTPUT_DIR / filename, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def rounded_box(ax, x, y, w, h, text, fc=None, ec=None, fontsize=10, weight="normal"):
    patch = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.02,rounding_size=1.8",
        linewidth=1.6,
        edgecolor=ec or PALETTE["line"],
        facecolor=fc or PALETTE["soft"],
    )
    ax.add_patch(patch)
    ax.text(
        x + w / 2,
        y + h / 2,
        text,
        ha="center",
        va="center",
        fontsize=fontsize,
        color=PALETTE["ink"],
        fontweight=weight,
        wrap=True,
    )
    return patch


def package_box(ax, x, y, w, h, title, body=None):
    rounded_box(ax, x, y, w, h, "", fc="white", ec=PALETTE["line"])
    rounded_box(
        ax,
        x + 2,
        y + h - 10,
        28,
        7,
        title,
        fc=PALETTE["accent"],
        fontsize=10,
        weight="bold",
    )
    if body:
        ax.text(
            x + w / 2,
            y + h / 2 - 3,
            body,
            ha="center",
            va="center",
            fontsize=9.5,
            color=PALETTE["ink"],
            wrap=True,
        )


def actor(ax, x, y, label):
    head = Circle(
        (x, y + 8),
        2.4,
        edgecolor=PALETTE["line"],
        facecolor=PALETTE["actor"],
        linewidth=1.6,
    )
    ax.add_patch(head)
    ax.plot([x, x], [y + 1.5, y + 6], color=PALETTE["line"], lw=1.8)
    ax.plot([x - 4, x + 4], [y + 4.5, y + 4.5], color=PALETTE["line"], lw=1.8)
    ax.plot([x, x - 3.5], [y + 1.5, y - 4], color=PALETTE["line"], lw=1.8)
    ax.plot([x, x + 3.5], [y + 1.5, y - 4], color=PALETTE["line"], lw=1.8)
    ax.text(
        x,
        y - 7,
        label,
        ha="center",
        va="center",
        fontsize=10,
        color=PALETTE["ink"],
        fontweight="bold",
    )


def use_case(ax, x, y, w, h, label):
    e = Ellipse(
        (x, y),
        w,
        h,
        edgecolor=PALETTE["line"],
        facecolor=PALETTE["soft_alt"],
        linewidth=1.5,
    )
    ax.add_patch(e)
    ax.text(
        x,
        y,
        label,
        ha="center",
        va="center",
        fontsize=9.5,
        color=PALETTE["ink"],
        wrap=True,
    )
    return e


def arrow(
    ax,
    start,
    end,
    text=None,
    style="-|>",
    linestyle="-",
    rad=0.0,
    lw=1.4,
    color=None,
    text_offset=(0, 0),
    text_align="center",
):
    patch = FancyArrowPatch(
        start,
        end,
        arrowstyle=style,
        mutation_scale=14,
        linewidth=lw,
        linestyle=linestyle,
        color=color or PALETTE["line"],
        connectionstyle=f"arc3,rad={rad}",
    )
    ax.add_patch(patch)
    if text:
        mx = (start[0] + end[0]) / 2 + text_offset[0]
        my = (start[1] + end[1]) / 2 + text_offset[1]
        ax.text(
            mx,
            my,
            text,
            fontsize=8.8,
            color=PALETTE["ink"],
            ha=text_align,
            va="center",
            bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="#d6e2ec"),
        )
    return patch


def dashed_line(ax, x, y1, y2):
    ax.plot([x, x], [y1, y2], linestyle=(0, (4, 4)), color="#9aa9b5", lw=1.2)


def node(ax, x, y, w, h, title, subtitle):
    rounded_box(ax, x, y, w, h, "", fc=PALETTE["node"], ec=PALETTE["line"])
    rounded_box(
        ax,
        x + 2,
        y + h - 9,
        24,
        6.5,
        title,
        fc=PALETTE["accent"],
        fontsize=10,
        weight="bold",
    )
    ax.text(
        x + w / 2,
        y + h / 2 - 2,
        subtitle,
        ha="center",
        va="center",
        fontsize=9.5,
        color=PALETTE["ink"],
        wrap=True,
    )


def artifact(ax, x, y, w, h, label):
    rounded_box(ax, x, y, w, h, label, fc="white", ec=PALETTE["line"], fontsize=9.5)
    ax.plot(
        [x + w - 6, x + w - 2, x + w - 2, x + w - 6, x + w - 6],
        [y + h, y + h, y + h - 4, y + h - 4, y + h],
        color=PALETTE["line"],
        lw=1.2,
    )


def draw_use_case_diagram():
    fig, ax = setup_ax(title="Use Case Diagram - Ethical Supply Chain Platform")
    package_box(ax, 18, 14, 64, 74, "Ethical Supply Chain System")

    actor(ax, 6, 76, "Admin")
    actor(ax, 6, 52, "Manufacturer")
    actor(ax, 6, 26, "Authority")
    actor(ax, 94, 58, "Distributor / Retailer")
    actor(ax, 94, 26, "Public Verifier")

    use_case(ax, 38, 76, 21, 9, "Register or\nRevoke Actors")
    use_case(ax, 64, 76, 21, 9, "Manage Blacklist\nand Threshold")
    use_case(ax, 38, 55, 23, 9, "Register Product\nwith Certificate Hash")
    use_case(ax, 64, 55, 21, 9, "Upload Evidence\nto IPFS")
    use_case(ax, 38, 34, 21, 9, "Approve or Reject\nProduct")
    use_case(ax, 64, 35, 23, 9, "Advance Lifecycle\nand Transfer Custody")
    use_case(ax, 51, 20, 25, 9, "Verify Product\nand Trace Status")

    arrow(ax, (12, 80), (28, 77), style="-")
    arrow(ax, (12, 74), (54, 77), style="-")
    arrow(ax, (12, 55), (28, 55), style="-")
    arrow(ax, (12, 50), (54, 55), style="-")
    arrow(ax, (12, 30), (28, 34), style="-")
    arrow(ax, (88, 61), (76, 37), style="-")
    arrow(ax, (88, 28), (63, 21), style="-")

    arrow(
        ax, (49, 55), (54, 55), text="<<include>>", linestyle="--", text_offset=(0, 6)
    )
    arrow(
        ax, (63, 33), (63, 24), text="<<include>>", linestyle="--", text_offset=(0, -4)
    )

    ax.text(
        50,
        9,
        "Actors interact with both the baseline comparison flow and the proposed multi-authority workflow.",
        ha="center",
        va="center",
        fontsize=9,
        color="#5a6b77",
    )
    save(fig, "use_case_diagram.png")


def draw_sequence_diagram():
    fig, ax = setup_ax((15, 10), "Sequence Diagram - Proposed Ethical Validation Flow")
    participants = [
        (10, "Manufacturer"),
        (30, "Web App"),
        (50, "IPFS / Filebase"),
        (70, "EthicalSupplyChain"),
        (90, "Authority Pool"),
    ]

    for x, label in participants:
        rounded_box(ax, x - 7, 89, 14, 7, label, fc=PALETTE["accent"], weight="bold")
        dashed_line(ax, x, 14, 88)

    steps = [
        (82, 10, 30, "Connect wallet + submit product data", (0, 3)),
        (74, 30, 50, "Upload certificate evidence", (0, 3)),
        (66, 50, 30, "Return CID", (0, -3)),
        (58, 30, 70, "registerProduct(productId, certificateHash)", (0, 3)),
        (50, 70, 30, "ProductRegistered event", (0, -3)),
        (42, 30, 90, "Notify authorities for review", (0, 3)),
        (34, 90, 70, "approveProduct(productId) - authority #1", (0, 3)),
        (26, 70, 90, "approvalCount = 1", (0, -3)),
        (18, 90, 70, "approveProduct(productId) - authority #2", (0, 3)),
        (12, 70, 30, "validationStatus = Approved", (0, -3)),
    ]
    for y, x1, x2, label, offset in steps:
        arrow(ax, (x1, y), (x2, y), text=label, text_offset=offset)

    arrow(
        ax,
        (30, 6),
        (70, 6),
        text="advanceStage(productId, distributor)",
        text_offset=(0, 3),
    )
    ax.text(
        70,
        2.5,
        "Lifecycle proceeds only after threshold approval",
        ha="center",
        fontsize=9.5,
        color=PALETTE["ink"],
        fontweight="bold",
    )
    save(fig, "sequence_diagram.png")


def draw_component_diagram():
    fig, ax = setup_ax(title="Component Diagram - Ethical Supply Chain Solution")

    package_box(ax, 6, 18, 88, 72, "System Components")

    rounded_box(
        ax,
        12,
        65,
        22,
        14,
        "Next.js Web App\n- Landing dashboard\n- Verification console\n- Wallet console",
        fc=PALETTE["soft"],
    )
    rounded_box(
        ax, 40, 65, 20, 14, "API Route\n/IPFS upload\nproxy", fc=PALETTE["soft"]
    )
    rounded_box(ax, 66, 65, 20, 14, "MetaMask /\nBrowser Wallet", fc=PALETTE["soft"])

    rounded_box(
        ax,
        12,
        39,
        22,
        14,
        "BasePaperMedicine\nSupplyChain.sol\n(Baseline)",
        fc="#f8f3ea",
    )
    rounded_box(ax, 40, 39, 20, 14, "EthicalSupplyChain.sol\n(Proposed)", fc="#eef7ef")
    rounded_box(
        ax, 66, 39, 20, 14, "Filebase IPFS\nRPC Service", fc=PALETTE["soft_alt"]
    )

    rounded_box(
        ax,
        25,
        21,
        22,
        11,
        "Hardhat Test Suite\nComparison.spec.ts\nEthicalSupplyChain.ts",
        fc=PALETTE["accent"],
    )
    rounded_box(
        ax, 54, 21, 22, 11, "Sepolia / Localhost\nEthereum Network", fc=PALETTE["node"]
    )

    arrow(ax, (34, 72), (40, 72), text="HTTP form-data", text_offset=(0, 3))
    arrow(ax, (34, 68), (66, 72), text="wallet calls", rad=0.08, text_offset=(0, 3))
    arrow(
        ax, (50, 65), (76, 53), text="upload evidence", rad=-0.08, text_offset=(0, -3)
    )
    arrow(
        ax, (72, 65), (52, 53), text="contract tx / reads", rad=0.08, text_offset=(0, 3)
    )
    arrow(
        ax,
        (72, 65),
        (24, 53),
        text="baseline tx / reads",
        rad=-0.15,
        text_offset=(0, 3),
    )
    arrow(ax, (50, 39), (65, 26), text="deploy / test", text_offset=(0, 3))
    arrow(ax, (36, 26), (23, 39), text="baseline assertions", text_offset=(0, -3))
    arrow(ax, (47, 26), (50, 39), text="proposed assertions", text_offset=(0, -3))
    arrow(
        ax, (76, 46), (61, 46), text="CID / certificate reference", text_offset=(0, 3)
    )

    save(fig, "component_diagram.png")


def draw_deployment_diagram():
    fig, ax = setup_ax(title="Deployment Diagram - Demo and Test Environment")

    node(ax, 6, 56, 26, 28, "Client Device", "Browser\nNext.js UI\nMetaMask Extension")
    artifact(ax, 12, 61, 14, 7, "wallet-console.tsx")

    node(
        ax, 37, 56, 26, 28, "Web Server", "Next.js App Router\nAPI Route\nStatic assets"
    )
    artifact(ax, 43, 61, 14, 7, "api/ipfs/upload")

    node(
        ax,
        68,
        56,
        26,
        28,
        "Blockchain Layer",
        "Ethereum Sepolia\nor Local Hardhat Node",
    )
    artifact(ax, 72, 66, 18, 6, "EthicalSupplyChain")
    artifact(ax, 72, 58, 18, 6, "BasePaperMedicine")

    node(
        ax,
        22,
        18,
        26,
        24,
        "Storage Service",
        "Filebase IPFS RPC\nPinned evidence\nCertificate files",
    )
    node(
        ax,
        54,
        18,
        34,
        24,
        "Developer Workstation",
        "Hardhat\ncompare-gas.ts\ncontract tests\nuv + matplotlib diagrams",
    )

    arrow(ax, (32, 70), (37, 70), text="HTTPS", text_offset=(0, 3))
    arrow(
        ax,
        (32, 63),
        (68, 67),
        text="EIP-1193 / ethers.js",
        rad=0.08,
        text_offset=(0, 3),
    )
    arrow(
        ax, (50, 56), (35, 42), text="multipart upload", rad=0.12, text_offset=(0, -3)
    )
    arrow(ax, (48, 42), (54, 42), text="artifacts / scripts", text_offset=(0, 3))
    arrow(
        ax,
        (68, 52),
        (35, 42),
        text="contract addresses / ABI",
        rad=-0.18,
        text_offset=(0, 3),
    )
    arrow(ax, (48, 56), (35, 30), text="IPFS evidence", rad=0.08, text_offset=(0, -3))
    arrow(ax, (71, 30), (81, 56), text="deploy + test", text_offset=(0, 3))

    ax.text(
        50,
        8,
        "Deployment view shows the browser client, web application, blockchain network, storage service, and local development environment.",
        ha="center",
        fontsize=9,
        color="#5a6b77",
    )
    save(fig, "deployment_diagram.png")


def main():
    draw_use_case_diagram()
    draw_sequence_diagram()
    draw_component_diagram()
    draw_deployment_diagram()
    print(f"Generated diagrams in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
