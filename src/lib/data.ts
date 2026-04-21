export type ChecklistItemType = {
  id: string;
  category: string;
  title: string;
  description?: string;
};

export const CHECKLIST_ITEMS: ChecklistItemType[] = [
  // 1. 外観
  { id: "ext_1", category: "① 外観の確認", title: "ボディのキズ・修復跡", description: "明るい場所で様々な角度から確認してください" },
  { id: "ext_2", category: "① 外観の確認", title: "パネルの隙間・チリ合わせ", description: "左右対称か、極端なズレがないか" },
  { id: "ext_3", category: "① 外観の確認", title: "ガラス・ルーフのヒビ割れ", description: "飛び石による欠けなどがないか" },
  { id: "ext_4", category: "① 外観の確認", title: "ホイール・タイヤの傷", description: "縁石などで擦った跡がないか" },
  { id: "ext_5", category: "① 外観の確認", title: "ライト類の動作と曇り", description: "ヘッドライト、テールライトの点灯と内部の曇り" },
  { id: "ext_6", category: "① 外観の確認", title: "ワイパーとウォッシャー液", description: "周囲に注意して動作を確認" },

  // 2. 内装
  { id: "int_1", category: "② 内装の確認", title: "シートの汚れ・シワ", description: "特に後部座席や死角になりやすい箇所" },
  { id: "int_2", category: "② 内装の確認", title: "天井・ピラーの内張り", description: "シミやタワミ、浮きがないか" },
  { id: "int_3", category: "② 内装の確認", title: "ダッシュボード・コンソール", description: "傷や組み立て不良がないか" },
  { id: "int_4", category: "② 内装の確認", title: "座席の調整機能", description: "前後・上下の電動調整が正常に動くか" },
  { id: "int_5", category: "② 内装の確認", title: "フロアマットの設置状況", description: "正しく敷かれているか" },

  // 3. テクノロジー・機能
  { id: "tech_1", category: "③ ソフトウェア・機能", title: "スクリーンの表示とタッチ", description: "ドット抜けや四隅のタップ反応" },
  { id: "tech_2", category: "③ ソフトウェア・機能", title: "ナビ・現在地の表示", description: "GPSが正しく取得できているか" },
  { id: "tech_3", category: "③ ソフトウェア・機能", title: "各種カメラの映像", description: "バックカメラ、左右サイドカメラが鮮明か" },
  { id: "tech_4", category: "③ ソフトウェア・機能", title: "スマートフォンのペアリング", description: "電話キーとして正常に連携できるか確認" },
  { id: "tech_5", category: "③ ソフトウェア・機能", title: "USBポート・ワイヤレス充電", description: "充電が開始されるか確認" },
  { id: "tech_6", category: "③ ソフトウェア・機能", title: "グローブボックスの開閉", description: "モニターからの操作で開くか（次のカテゴリのチェックと併せて確認）" },

  // 4. 書類・付属品（グローブボックスを開けた流れで確認）
  { id: "doc_1", category: "④ 書類・付属品", title: "車検証と取扱説明書", description: "グローブボックス内を確認" },
  { id: "doc_2", category: "④ 書類・付属品", title: "登録内容の一致", description: "氏名・住所・VIN（車台番号）の相違がないか" },
  { id: "doc_5", category: "④ 書類・付属品", title: "USBドライブ（事前挿入）", description: "ドライブレコーダー用USBがグローブボックス内に刺さっているか" },
  { id: "doc_3", category: "④ 書類・付属品", title: "カードキー", description: "通常2枚付属しているか" },
  { id: "doc_4", category: "④ 書類・付属品", title: "停止表示器材・発煙筒", description: "三角反射板など指定の備品があるか" },

  // 5. バッテリー・充電
  { id: "bat_1", category: "⑤ バッテリー・充電", title: "納車時のバッテリー残量", description: "通常は50%〜70%以上を目安に" },
  { id: "bat_2", category: "⑤ バッテリー・充電", title: "充電ポートの開閉", description: "タッチやアプリからスムーズに開閉するか" },

  // 6. 試運転チェック
  { id: "drv_1", category: "⑥ 試運転チェック", title: "アクセル・ブレーキの反応", description: "違和感がないか（安全な場所で）" },
  { id: "drv_2", category: "⑥ 試運転チェック", title: "ハンドル・サスペンション", description: "直進安定性や気になる振動がないか" },
  { id: "drv_3", category: "⑥ 試運転チェック", title: "異音の有無", description: "走行中や段差で気になる音がしないか" },
  { id: "drv_4", category: "⑥ 試運転チェック", title: "冷暖房の効き", description: "エアコン・シートヒーターの動作" },
  { id: "drv_5", category: "⑥ 試運転チェック", title: "安全機能の警告", description: "不要な警告灯が点灯していないか" }
];
