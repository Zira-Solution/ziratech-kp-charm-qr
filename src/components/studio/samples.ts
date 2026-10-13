// Ready-made letters the buyer can start from. These are plain suggestions (not AI): the buyer picks one,
// then edits it. Nothing is ever filled in automatically.

export interface LetterSample {
  id: string;
  label: string;
  title: string;
  content: string;
  signature: string;
}

export const LETTER_SAMPLES: readonly LetterSample[] = [
  {
    id: "lover",
    label: "Người yêu",
    title: "GỬI NGƯỜI THƯƠNG",
    content:
      "Gửi người con gái luôn mang nụ cười rạng rỡ nhất. Chiếc vòng nhỏ này sẽ thay mình đồng hành cùng em qua mọi ngày, và nhắc em nhớ rằng em luôn là điều dịu dàng nhất của mùa thu. Chúc em 20/10 thật nhiều niềm vui.",
    signature: "Người thương em ♡",
  },
  {
    id: "friend",
    label: "Bạn thân",
    title: "GỬI BẠN THÂN",
    content:
      "Cảm ơn bạn vì đã luôn ở bên cạnh, chia nửa ly trà sữa những ngày ôn thi thâu đêm và cười cùng mình những lúc ngớ ngẩn nhất. Chúc bạn 20/10 mãi xinh đẹp, rạng rỡ và qua môn mọi kỳ thi!",
    signature: "Bạn thân của cậu ♡",
  },
  {
    id: "teacher",
    label: "Thầy cô",
    title: "TRI ÂN THẦY CÔ",
    content:
      "Nhân ngày 20/10, em xin gửi trọn lòng biết ơn đến Cô. Cảm ơn Cô vì những bài giảng tâm huyết và sự tận tụy đã luôn soi đường cho chúng em vững bước. Kính chúc Cô thật nhiều sức khỏe và hạnh phúc.",
    signature: "Học trò của Cô ♡",
  },
  {
    id: "mom",
    label: "Mẹ",
    title: "GỬI MẸ KÍNH YÊU",
    content:
      "Mẹ ơi, con chưa nói được hết những điều con muốn nói với mẹ. Cảm ơn mẹ vì đã hy sinh thầm lặng, vì những bữa cơm ấm và những lần mẹ lo cho con. Chúc mẹ 20/10 luôn bình an và thật vui nhé.",
    signature: "Con của mẹ ♡",
  },
  {
    id: "crush",
    label: "Người thầm thương",
    title: "MỘT ĐIỀU NHỎ",
    content:
      "Có những điều mình chưa đủ can đảm nói thành lời, nên mình gửi vào món quà nhỏ này. Mong nụ cười của bạn luôn tỏa sáng như nắng mùa thu. Chúc bạn 20/10 thật ngọt ngào.",
    signature: "Một người luôn dõi theo bạn ♡",
  },
];
