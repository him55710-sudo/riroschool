import type { Artifact } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "shared";
import { getAuthOptions } from "../../lib/auth";
import { isAdminEmail } from "../../lib/rbac";
import { AdminControls } from "./AdminControls";

const parseQaScore = (metadata: string | null) => {
    if (!metadata) return "N/A";

    try {
        const parsed = JSON.parse(metadata) as { score?: unknown };
        if (typeof parsed.score === "number") {
            return `Score: ${parsed.score}/100`;
        }
        return "N/A";
    } catch {
        return "N/A";
    }
};

export default async function AdminPage() {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
        redirect("/login?next=/admin");
    }
    if (!isAdminEmail(session.user.email)) {
        redirect("/");
    }

    let adminConfig = await prisma.adminConfig.findUnique({ where: { id: "singleton" } });
    if (!adminConfig) {
        adminConfig = await prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
    }

    const recentJobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { artifacts: true },
    });

    return (
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
            <section className="toss-card p-7 md:p-9">
                <h1 className="text-3xl font-extrabold md:text-4xl">Admin Dashboard</h1>
                <p className="mt-2 text-sm text-[var(--toss-sub)]">프롬프트 버전과 최근 작업 품질을 한 화면에서 점검합니다.</p>
            </section>

            <div className="mt-5">
                <AdminControls currentVersion={adminConfig.activePromptVersion} />
            </div>

            <section className="toss-card mt-5 p-6">
                <h2 className="text-2xl font-extrabold">Recent Jobs & Quality Reports</h2>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--toss-line)] bg-white">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                        <thead className="bg-[#f3f7ff] text-[var(--toss-sub)]">
                            <tr>
                                <th className="px-4 py-3 font-bold">Job ID</th>
                                <th className="px-4 py-3 font-bold">Topic</th>
                                <th className="px-4 py-3 font-bold">Tier</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold">Quality QA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentJobs.map((job) => {
                                const artifacts = job.artifacts as Artifact[];
                                const qaArtifact = artifacts.find((artifact) => artifact.type === "QA_REPORT");
                                const qaSummary = parseQaScore(qaArtifact?.metadata || null);

                                return (
                                    <tr key={job.id} className="border-t border-[var(--toss-line)]">
                                        <td className="px-4 py-3 text-xs text-[var(--toss-sub)]">{job.id}</td>
                                        <td className="px-4 py-3 font-semibold text-[var(--toss-ink)]">{job.topic}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-xs font-extrabold text-[var(--toss-primary)]">{job.tier}</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-[var(--toss-sub)]">{job.status}</td>
                                        <td className="px-4 py-3 font-semibold text-[var(--toss-sub)]">{qaSummary}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
