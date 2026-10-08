export type GiftTemplateId = "vintage-scrapbook" | "retro-nostalgia" | "storybook-sunset";

export interface RecipientGiftData {
  recipientName: string;
  senderName: string;
  braceletImg: string;
  braceletTitle: string;
  braceletStoryQuote: string;
  letterTitle: string;
  letterSubtitle: string;
  letterContent: string;
  letterSignature: string;
  memoryPhotos: {
    url: string;
    caption: string;
    date?: string;
  }[];
  momentPhotos: {
    url: string;
    caption: string;
  }[];
  videoUrl?: string;
  song: {
    title: string;
    artist: string;
    audioUrl?: string;
    duration: string;
  };
  voiceNote: {
    audioUrl?: string;
    duration: string;
    noteText: string;
  };
  finalMessage: string;
  coverIllustrationUrl?: string;
}

export const DEFAULT_GIFT_DATA: RecipientGiftData = {
  recipientName: "Bảo Ngọc",
  senderName: "Người bạn đặc biệt",
  braceletImg: "/images/ocean_charm_bracelet.jpg",
  braceletTitle: "Vòng Tay Charm Kỷ Niệm 'Ocean Star' S925",
  braceletStoryQuote: "Có những kỷ niệm không cần phải thật lớn, chỉ cần đủ đặc biệt để chúng ta luôn nhớ mãi.",
  letterTitle: "LỜI NHẮN",
  letterSubtitle: "Vẫn còn vài điều mình muốn kể bạn nghe... ♡",
  letterContent: "Có vài điều mình luôn muốn nói nhưng chưa có dịp... Hôm nay, mình muốn gửi tất cả vào món quà nhỏ này.\n\nCảm ơn vì đã luôn ở bên cạnh, cùng đi qua những ngày tháng rực rỡ và ấm áp nhất. Mong nụ cười của bạn luôn tỏa sáng như ánh nắng mùa thu nhé!",
  letterSignature: "Người bạn luôn dõi theo ♡",
  memoryPhotos: [
    {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      caption: "Những buổi chiều đi dạo...",
    },
    {
      url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
      caption: "Cúc họa mi mùa thu...",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
      caption: "Hoàng hôn biển yên bình...",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
      caption: "Những lần cà phê...",
    },
  ],
  momentPhotos: [
    {
      url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&auto=format&fit=crop&q=80",
      caption: "Bãi biển mùa hè rực rỡ",
    },
    {
      url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80",
      caption: "Hàng dừa hoàng hôn",
    },
  ],
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-couple-walking-on-the-beach-at-sunset-41487-large.mp4",
  song: {
    title: "Có Chàng Trai Viết Lên Cây",
    artist: "Phan Mạnh Quỳnh",
    duration: "3:45",
  },
  voiceNote: {
    duration: "02:34",
    noteText: "Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình.",
  },
  finalMessage: "Món quà này sẽ luôn ở đây, mỗi khi bạn muốn nhớ lại. ♡",
  coverIllustrationUrl: "/images/anime_sunset_gift_box.jpg",
};
