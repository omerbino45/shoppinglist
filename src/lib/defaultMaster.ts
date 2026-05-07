import type { MasterCategory } from '../types';

let _counter = 0;
const catId = () => `cat-${++_counter}`;

export const DEFAULT_MASTER: MasterCategory[] = [
  {
    id: catId(), name: "ירקות ופירות", icon: "🥬", color: "#4a7c59",
    items: [
      { name: "ירקות טובים (מה שנראה טרי)", freq: "monthly" },
      { name: "אבוקדו", freq: "monthly" },
      { name: "תפוחי אדמה", freq: "monthly" },
      { name: "שום (ראשים)", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "מוצרי חלב וקירור", icon: "🧀", color: "#457b9d",
    items: [
      { name: "גבינת שמנת 25-30% (חבילה גדולה)", freq: "monthly" },
      { name: "חלב", freq: "monthly" },
      { name: "חמאה", freq: "monthly" },
      { name: "שמנת מתוקה לבישול", freq: "monthly" },
      { name: "גבינה צהובה", freq: "monthly" },
      { name: "קוטג׳", freq: "monthly" },
      { name: "ביצים (תבנית גדולה)", freq: "monthly" },
      { name: "גבינת פרמזן", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "לחם ומאפים", icon: "🍞", color: "#bc6c25",
    items: [
      { name: "פירורי לחם", freq: "occasional" },
      { name: "לחמניות", freq: "monthly" },
      { name: "פריכיות אורז", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "פסטה, אורז וקטניות", icon: "🍝", color: "#b07d3b",
    items: [
      { name: "חבילות פסטה (ספגטי/פנה/פוזילי)", freq: "monthly" },
      { name: "אורז בסמטי", freq: "monthly" },
      { name: "תירס בפחית", freq: "monthly" },
      { name: "פתיתים", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "רטבים וממרחים", icon: "🫙", color: "#d62828",
    items: [
      { name: "קטשופ", freq: "monthly" },
      { name: "מיונז", freq: "monthly" },
      { name: "ברביקיו", freq: "monthly" },
      { name: "ממרח עגבניות מיובשות", freq: "occasional" },
      { name: "רוטב עגבניות מרוכז", freq: "monthly" },
      { name: "טחינה", freq: "monthly" },
      { name: "חמאת בוטנים", freq: "monthly" },
      { name: "דבש", freq: "occasional" },
      { name: "חומץ", freq: "occasional" },
      { name: "שמן זית", freq: "monthly" },
      { name: "רוטב סויה", freq: "occasional" },
      { name: "רוטב צ׳ילי מתוק", freq: "occasional" },
      { name: "רוטב טריאקי", freq: "occasional" },
      { name: "רוטב פסטו", freq: "occasional" },
      { name: "נוטלה", freq: "monthly" },
      { name: "ריבה", freq: "occasional" },
      { name: "סילאן", freq: "occasional" },
      { name: "רוטב מייפל", freq: "occasional" },
      { name: "זיתים (ירוקים / שחורים)", freq: "monthly" },
      { name: "מלפפון חמוץ", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "תבלינים", icon: "🌶️", color: "#9b2226",
    items: [
      { name: "מלח", freq: "occasional" },
      { name: "סוכר", freq: "occasional" },
      { name: "פלפל שחור", freq: "occasional" },
      { name: "פפריקה מתוקה", freq: "occasional" },
      { name: "פפריקה חריפה", freq: "occasional" },
      { name: "כורכום", freq: "occasional" },
      { name: "כמון", freq: "occasional" },
      { name: "קינמון", freq: "occasional" },
      { name: "אורגנו", freq: "occasional" },
      { name: "בזיליקום יבש", freq: "occasional" },
      { name: "אבקת שום", freq: "occasional" },
      { name: "צ׳ילי פלייקס", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "שתייה", icon: "🥤", color: "#0077b6",
    items: [
      { name: "קפה Taster's Choice", freq: "monthly" },
      { name: "שישיית זירו (קולה/פפסי)", freq: "monthly" },
      { name: "שישייה שתייה קלה אחרת", freq: "monthly" },
      { name: "תיונים", freq: "monthly" },
      { name: "שוקולית", freq: "monthly" },
      { name: "קפה שחור (טורקי)", freq: "monthly" },
      { name: "קפסולות קפה", freq: "monthly" },
      { name: "ויטמינצ׳יק", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "ארוחת בוקר ודגנים", icon: "🥣", color: "#dda15e",
    items: [
      { name: "קורנפלקס", freq: "monthly" },
      { name: "גרנולה", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "חטיפים ונשנושים", icon: "🍿", color: "#e76f51",
    items: [
      { name: "בייגלה", freq: "monthly" },
      { name: "סניידרז", freq: "monthly" },
      { name: "קליק", freq: "monthly" },
      { name: "שקדי מרק", freq: "monthly" },
      { name: "ערגליות", freq: "monthly" },
      { name: "במבה", freq: "monthly" },
      { name: "ביסלי", freq: "monthly" },
      { name: "פופקורן", freq: "monthly" },
      { name: "אגוזים מעורבים", freq: "monthly" },
      { name: "טבליות שוקולד (מריר/חלב)", freq: "monthly" },
      { name: "עוגיות", freq: "monthly" },
      { name: "גלידה", freq: "monthly" },
      { name: "מסטיקים", freq: "monthly" },
      { name: "וופלים", freq: "monthly" },
      { name: "קרקרים", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "שימורים", icon: "🥫", color: "#7f5539",
    items: [
      { name: "טונה בפחית", freq: "monthly" },
      { name: "רסק עגבניות בפחית", freq: "monthly" },
      { name: "תירס בפחית", freq: "monthly" },
      { name: "מלפפון חמוץ (צנצנת)", freq: "monthly" },
      { name: "זיתים (צנצנת)", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "אפייה", icon: "🧁", color: "#8d6e63",
    items: [
      { name: "קמח", freq: "occasional" },
      { name: "אבקת אפייה", freq: "occasional" },
      { name: "תמצית וניל", freq: "occasional" },
      { name: "סוכר (לאפייה)", freq: "occasional" },
      { name: "שוקולד צ׳יפס", freq: "occasional" },
      { name: "קוקוס מגורד", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "ניקיון הבית", icon: "🧹", color: "#168aad",
    items: [
      { name: "מטליות ניקוי פרקט", freq: "monthly" },
      { name: "מטליות ניקוי רצפה", freq: "monthly" },
      { name: "סקוטצ׳ים", freq: "monthly" },
      { name: "סבון כלים", freq: "monthly" },
      { name: "אקונומיקה", freq: "monthly" },
      { name: "נוזל רצפות", freq: "occasional" },
      { name: "ספריי לניקוי משטחים / שמשות", freq: "occasional" },
      { name: "מרכך כביסה", freq: "monthly" },
      { name: "אבקת / ג׳ל כביסה", freq: "monthly" },
      { name: "שקיות אשפה (גדולות + קטנות)", freq: "monthly" },
      { name: "כפפות חד פעמיות", freq: "occasional" },
      { name: "סבון ידיים (מילוי)", freq: "occasional" },
      { name: "ספוגים למטבח", freq: "monthly" },
    ]
  },
  {
    id: catId(), name: "טיפוח ובריאות", icon: "🧴", color: "#7b2cbf",
    items: [
      { name: "סבון גוף", freq: "monthly" },
      { name: "שמפו", freq: "monthly" },
      { name: "משחת שיניים", freq: "monthly" },
      { name: "מברשת שיניים", freq: "occasional" },
      { name: "חוט דנטלי", freq: "occasional" },
      { name: "מי פה", freq: "occasional" },
      { name: "דאודורנט", freq: "monthly" },
      { name: "קרם הגנה מהשמש", freq: "occasional" },
      { name: "פלסטרים", freq: "occasional" },
      { name: "אקמול / נורופן", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "נייר וחד פעמי", icon: "🧻", color: "#6c757d",
    items: [
      { name: "טישו נייר רך", freq: "monthly" },
      { name: "נייר סופג", freq: "monthly" },
      { name: "נייר טואלט", freq: "monthly" },
      { name: "מגבונים Wow", freq: "monthly" },
      { name: "שקיות נייר", freq: "occasional" },
      { name: "שקיות ניילון", freq: "monthly" },
      { name: "כוסות חד פעמיות", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "מטבח ואריזה", icon: "🍳", color: "#495057",
    items: [
      { name: "ניילון נצמד", freq: "monthly" },
      { name: "נייר אלומיניום", freq: "monthly" },
      { name: "פילטרים של בריטה", freq: "occasional" },
      { name: "נייר אפייה", freq: "occasional" },
      { name: "שקיות פריזר (זיפלוק)", freq: "occasional" },
      { name: "קיסמים", freq: "occasional" },
    ]
  },
  {
    id: catId(), name: "קפואים", icon: "🧊", color: "#0077b6",
    items: [
      { name: "שניצלים / נאגטס קפואים", freq: "monthly" },
      { name: "ירקות קפואים (תערובת/ברוקולי/תרד)", freq: "monthly" },
      { name: "צ׳יפס קפוא", freq: "monthly" },
      { name: "פוטטוז קפוא", freq: "monthly" },
      { name: "פיצה קפואה", freq: "monthly" },
    ]
  }
];
