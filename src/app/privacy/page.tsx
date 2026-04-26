import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">개인정보 처리방침</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-muted-foreground mb-6">
            옆집약사는 개인정보 보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 처리 목적</h2>
            <p>옆집약사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>회원 가입 및 관리</li>
              <li>문의 및 상담 서비스 제공</li>
              <li>서비스 개선 및 맞춤형 서비스 제공</li>
              <li>법령 및 약관의 의무사항 이행</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 처리 및 보유 기간</h2>
            <p>옆집약사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>회원정보: 회원 탈퇴 시까지</li>
              <li>문의 및 상담 기록: 3년</li>
              <li>결제 기록: 5년 (전자상거래법)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. 처리하는 개인정보의 항목</h2>
            <p>옆집약사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>필수항목: 이름, 이메일, 비밀번호</li>
              <li>선택항목: 전화번호, 프로필 이미지</li>
              <li>자동 수집 항목: 접속 IP, 쿠키, 서비스 이용 기록</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
            <p>옆집약사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 파기</h2>
            <p>옆집약사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
              <li>종이 문서: 분쇄 또는 소각</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p>정보주체는 옆집약사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. 개인정보 보호책임자</h2>
            <p>옆집약사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold">개인정보 보호책임자</p>
              <p>이메일: admin@nh.com</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. 개인정보 처리방침 변경</h2>
            <p>이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
