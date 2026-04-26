import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">서비스 이용약관</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-muted-foreground mb-6">
            옆집약사 서비스를 이용해 주셔서 감사합니다. 본 약관은 회원이 옆집약사가 제공하는 서비스를 이용함에 있어 회원과 옆집약사의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p>본 약관은 옆집약사(이하 "회사")가 제공하는 온라인 건강정보 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <ul className="list-disc pl-6">
              <li>"서비스"란 회사가 제공하는 건강정보, 문의상담, 영양제 정보 등 일체의 서비스를 의미합니다.</li>
              <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li>"아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
              <li>"비밀번호"란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
            <p>① 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
            <p>② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
            <p>③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <p>① 회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
            <p>② 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
              <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
              <li>관계법령에 위배되거나 사회의 안녕과 질서, 미풍양속을 저해할 목적으로 신청한 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <p>① 회사는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>건강 및 의료 정보 제공</li>
              <li>문의 및 상담 서비스</li>
              <li>영양제 및 건강식품 정보 제공</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
            <p>② 회사는 서비스의 내용을 변경할 수 있으며, 변경 시에는 서비스 화면에 공지합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
            <p>① 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
            <p>② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (회원의 의무)</h2>
            <p>① 회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-6 mt-2">
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (의료 정보의 한계)</h2>
            <p>① 본 서비스에서 제공되는 건강 및 의료 정보는 일반적인 정보 제공을 목적으로 하며, 전문적인 의료 상담이나 진단을 대체할 수 없습니다.</p>
            <p>② 회원은 본 서비스의 정보를 참고자료로만 활용하고, 구체적인 의료 행위는 반드시 의료 전문가와 상담 후 결정해야 합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (면책조항)</h2>
            <p>① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
            <p>② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
            <p>③ 회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제10조 (준거법 및 재판관할)</h2>
            <p>① 회사와 회원 간 제기된 소송은 대한민국법을 준거법으로 합니다.</p>
            <p>② 회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">부칙</h2>
            <p>본 약관은 2025년 1월 1일부터 적용됩니다.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
