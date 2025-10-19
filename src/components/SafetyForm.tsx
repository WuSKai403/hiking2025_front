import React, { useState, useEffect } from 'react';
import { Combobox } from './ui/combobox'; // 引入 Combobox
import type { ComboboxOption } from './ui/combobox';

// 定義從 /api/trails 回傳的步道結構
interface Trail {
  id: number;
  name: string;
  location: string;
  difficulty: string;
  review_count: number;
}

// 定義 API 回傳的結構 (簡化版)
interface RecommendationResult {
  safety_score: number;
  recommendation: string; // <--- 修正欄位名稱
  reasoning: string;      // <--- 新增欄位
  // ... 其他結構化建議
}

const SafetyForm: React.FC = () => {
  const [trailId, setTrailId] = useState('108');
  const [trails, setTrails] = useState<ComboboxOption[]>([]);
  const [userDesc, setUserDesc] = useState('預計下午兩點出發，單人輕裝，天氣看起來有點陰。');
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const response = await fetch('/api/trails');
        if (!response.ok) {
          throw new Error('無法獲取步道列表');
        }
        const data: Trail[] = await response.json();

        const formattedTrails = data.map(trail => ({
          value: trail.id.toString(),
          label: trail.name,
        }));
        setTrails(formattedTrails);
      } catch (err) {
        console.error(err);
        // 可以在這裡設定一個錯誤狀態來通知使用者
      }
    };

    fetchTrails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      trail_id: trailId,
      user_path_desc: userDesc,
    };

    try {
      // **關鍵點：直接呼叫 /api/recommendation，Cloudflare 會自動轉發**
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.statusText}`);
      }

      const data: RecommendationResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('查詢失敗，請確認 API 服務是否正常。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">快樂登山家 | 路徑安全查詢</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">路徑 ID / 名稱</label>
          <Combobox
            options={trails}
            value={trailId}
            onChange={setTrailId}
            placeholder="選擇或搜尋步道..."
            searchPlaceholder="搜尋步道 ID 或名稱..."
            emptyText="找不到步道。"
            className="w-full mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">健行情境描述 (提供給 AI 判讀)</label>
          <textarea
            value={userDesc}
            onChange={(e) => setUserDesc(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'AI 正在判讀中...' : '取得安全建議'}
        </button>
      </form>

      {/* 結果顯示區 */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 space-y-2">
          <h3 className="text-xl font-semibold">安全評分: <span className="text-2xl">{result.safety_score} / 5</span></h3>
          <div>
            <h4 className="font-bold">AI 建議:</h4>
            <p className="whitespace-pre-wrap">{result.recommendation}</p>
          </div>
          <div>
            <h4 className="font-bold">理由:</h4>
            <p className="whitespace-pre-wrap">{result.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyForm;
