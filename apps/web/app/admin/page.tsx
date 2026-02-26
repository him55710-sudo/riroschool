import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "shared";
import { AdminControls } from "./AdminControls";

export default async function AdminPage() {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    // Retrieve current configuration
    let adminConfig = await prisma.adminConfig.findUnique({ where: { id: "singleton" } });
    if (!adminConfig) {
        adminConfig = await prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
    }

    // Fetch the 10 most recent jobs to view their Quality stage
    const recentJobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { artifacts: true }
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <AdminControls currentVersion={adminConfig.activePromptVersion} />

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Jobs & Quality Reports</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Job ID</th>
                            <th className="py-2">Topic</th>
                            <th className="py-2">Tier</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Quality QA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentJobs.map(job => {
                            const qaArtifact = job.artifacts.find((a: any) => a.type === "QA_REPORT");
                            let qaSummary = "N/A";
                            if (qaArtifact && qaArtifact.metadata) {
                                try {
                                    const parsed = JSON.parse(qaArtifact.metadata);
                                    qaSummary = `Score: ${parsed.score}/100`;
                                } catch (e) { }
                            }

                            return (
                                <tr key={job.id} className="border-b">
                                    <td className="py-2 text-sm text-gray-500">{job.id}</td>
                                    <td className="py-2">{job.topic}</td>
                                    <td className="py-2">
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{job.tier}</span>
                                    </td>
                                    <td className="py-2">{job.status}</td>
                                    <td className="py-2 text-sm">{qaSummary}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
