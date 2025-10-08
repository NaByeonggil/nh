"use client"

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎨 Tailwind CSS 테스트 페이지
        </h1>
        
        {/* Color Palette Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">색상 팔레트</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium">
              Primary
            </div>
            <div className="h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-medium">
              Secondary
            </div>
            <div className="h-20 bg-destructive rounded-lg flex items-center justify-center text-destructive-foreground font-medium">
              Destructive
            </div>
            <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-medium">
              Muted
            </div>
            <div className="h-20 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-medium">
              Accent
            </div>
            <div className="h-20 bg-card border rounded-lg flex items-center justify-center text-card-foreground font-medium">
              Card
            </div>
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">반응형 그리드</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">카드 {num}</h3>
                <p className="text-gray-600">반응형 테스트 카드입니다. 화면 크기를 조절해보세요.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Button Styles Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">버튼 스타일</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Success Button
            </button>
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Danger Button
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Outline Button
            </button>
          </div>
        </div>

        {/* Spacing and Typography Test */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">타이포그래피 & 간격</h2>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Extra Small Text (text-xs)</p>
            <p className="text-sm text-gray-600">Small Text (text-sm)</p>
            <p className="text-base text-gray-700">Base Text (text-base)</p>
            <p className="text-lg text-gray-800">Large Text (text-lg)</p>
            <p className="text-xl text-gray-900">Extra Large Text (text-xl)</p>
            <p className="text-2xl font-bold text-blue-600">2XL Bold Blue (text-2xl font-bold text-blue-600)</p>
          </div>
        </div>

        {/* Flexbox Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Flexbox 테스트</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded">
              <span className="font-medium">Left Item</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Center Badge</span>
              <span className="font-medium">Right Item</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-red-100 p-4 rounded text-center">Flex 1</div>
              <div className="flex-2 bg-green-100 p-4 rounded text-center">Flex 2</div>
              <div className="flex-1 bg-blue-100 p-4 rounded text-center">Flex 1</div>
            </div>
          </div>
        </div>

        {/* Animation Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">애니메이션 테스트</h2>
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-16 h-16 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-16 h-16 bg-red-500 rounded-full animate-spin"></div>
            <div className="w-16 h-16 bg-yellow-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Dark Mode Test (if enabled) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">다크모드 테스트</h2>
          <p className="text-gray-600 dark:text-gray-300">
            이 섹션은 다크모드가 활성화되면 자동으로 색상이 변경됩니다.
          </p>
        </div>

        {/* Test Results */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ Tailwind CSS 작동 상태</h3>
          <p className="text-green-700 text-sm">
            만약 이 페이지의 스타일이 올바르게 표시된다면 Tailwind CSS가 정상적으로 작동하고 있는 것입니다.
            <br />
            색상, 간격, 타이포그래피, 반응형 레이아웃이 모두 적용되어 보여야 합니다.
          </p>
        </div>
      </div>
    </div>
  )
}