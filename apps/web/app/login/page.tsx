import { BookOpen } from "lucide-react";
import { ClientLoginButton } from "./ClientLoginButton";

export default function LoginPage() {
    const isGoogleAuthMissing = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
    const isDev = process.env.NODE_ENV !== "production";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-blue-600">
                    <BookOpen size={48} />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                    로그인
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    성공적인 생기부 준비를 위한 첫 걸음
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <div className="space-y-6">
                        {isGoogleAuthMissing && isDev && (
                            <div className="bg-red-50 text-red-600 p-4 rounded text-sm font-semibold border border-red-200">
                                🚧 개발자 안내: Google OAuth 환경 변수(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)가 누락되었습니다.<br />
                                .env 파일을 다시 확인해주세요. 로그인 API로 이동 시 500 에러가 발생합니다.
                            </div>
                        )}
                        <div>
                            <ClientLoginButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
