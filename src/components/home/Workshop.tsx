import React from "react";

const STAGES = [
  {
    title: "Đo dây cước vừa vặn",
    text: "Chọn dây cước tơ trong suốt dẻo dai, đo theo đúng kích cỡ cổ tay người nhận để chiếc vòng ôm vừa xinh xắn.",
    alt: "Đôi tay đo dây cước trong suốt bằng thước dây trên bàn gỗ",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYurcktput4czjm2IO_1GeON6O7eSAWspjj3nXxWTZM7y7BIQLdMQeopNGFRi8rU6t_J62ulBzSrieKw9-JqqvX-gSn-_nPAagXbpHiv0N9G2gajIPq607TMWB9Bpo5CSvhPqjoNVeCq730LgNQ_xNJdzDXFK43XvW_9n7DL8Cv_mqnF2cqSAJK8g7rnG6QC0xICuMv6HiINOEDnQAlJ-Hxs9T4VQyx8p9qJuK784Gexk8T-eSwVF5Xw",
  },
  {
    title: "Chọn charm & xâu hạt",
    text: "Lựa chọn giữa hàng chục mẫu charm bạc: Trái tim, ánh sao, hoa cúc nhỏ cùng hạt pha lê pastel lấp lánh theo sở thích.",
    alt: "Charm bạc hình sao và trái tim được xâu vào dây cước bằng nhíp",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcmqGgTcw-y65xt62hTWR2v-VeBzc-KAV_YezpEeaaps2NOO76gn96DJc5qUrQTq0H0x9yg_gFq5dWiAwYViEkf7YQZbhAGpE_glEzPLdFn5nXdyFiyl82Aw5zg-mdFUh5gEqM8TGrzSoSNy1U8PAmwGvPQxtrOs-3cHGDgeIEi5awMx7FkMfaZtjXS2w3vjhi9xx_STWi9Wu4OcWh390aBjC54WOdir3HHs4l_YtNHkkBjUQxchlQVA",
  },
  {
    title: "Đóng gói hộp thiệp",
    text: "Đặt chiếc vòng vào hộp giấy kraft ép kim nắp mở sang trọng kèm lớp lót bảo vệ cẩn trọng tránh va chạm trầy xước.",
    alt: "Hộp quà giấy kraft lót giấy vụn buộc ruy băng hồng",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD740MSkdcMAS-1j7Z80Usuk4Yp6XxX306D92jg9HA5k5uij8NJaQRM1PZb9yytUIGV3e6q5DYtXoBJeLEBf20SgZqr6OflAs2HntqPo6Hrl4vANFKCnVCyL5EcsfxPlTWz2Z2QaoAYMuo0ZC6Ilhj5yUv4rjBch-K1vZL4zRL-uKvR3EuIdEssAv1XTJ5v3tvNhUjZPJB_0dQIa510fi1R0UsBOKgQLh2lNn_enO9rqa7VtQTM_5eA9w",
  },
  {
    title: "Gắn nhánh hoa & gửi mã QR",
    text: "Cài nhánh hoa baby khô xinh xắn để hoàn thiện kỷ vật trao tặng. Mã QR thiệp số được gửi riêng qua email, không đính kèm trong hộp.",
    alt: "Hộp quà hoàn thiện với nhánh baby khô",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWMJbd_8QoJcGOoqSNCntJnFbDJhsVwwhU1a9IHmKEjVLehFq4JyWQD5qrzp3qgM8zD2__tiClYKOt2M_7pDC0Ir2n9iA2kjJn9khNyrwlugf30wMkmwxaVONZJRylB2tcfBH9-KwvJmHM0Pb6lDVNH-5j0ML-bvxk0pbQpb40iQk9i_c4uM3aYKxXR6gPww3wZm1TniticU37w2x4v-MbM2KrG9EUb0CxR4MayfoDQkmee7Rt0vxX4Q",
  },
];

export default function Workshop() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24" id="workshop">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-xl text-primary font-sans text-xs font-semibold mb-3 border border-white/80 shadow-xs">
          <span className="material-symbols-outlined text-[15px] text-secondary-dark">handyman</span>
          <span>Khu Vực Workshop Trực Tiếp</span>
        </div>
        <h2 className="font-headline text-3xl sm:text-4xl text-primary mb-3 tracking-tight">Tự Tay Luồn Vòng Kỷ Vật</h2>
        <p className="font-body text-base text-on-surface-variant leading-relaxed">
          Tận hưởng từng phút giây thư thái tự tay kết từng hạt charm thủy tinh, dây cước trong veo gửi trọn chân tình tại gian hàng sảnh lầu 2.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAGES.map((s, i) => (
          <li
            key={s.title}
            className="p-6 rounded-[32px] bg-linear-to-br from-white/70 via-white/50 to-white/30 backdrop-blur-2xl border border-white/80 shadow-liquid-card flex flex-col hover:shadow-liquid-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-primary font-bold flex items-center justify-center mb-4 font-headline text-base shadow-xs">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="aspect-video w-full rounded-[22px] bg-surface-container-low overflow-hidden mb-4 shadow-inner">
              <img className="w-full h-full object-cover" alt={s.alt} loading="lazy" src={s.img} />
            </div>
            <h3 className="font-headline text-lg text-primary font-bold mb-2">{s.title}</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
