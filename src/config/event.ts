export interface EventScheduleDay {
  day: string;
  date: string;
  hours: string;
  venue: string;
  status: string;
  highlight?: boolean;
}

export const EVENT_SCHEDULE: EventScheduleDay[] = [
  {
    day: "Thứ Sáu",
    date: "16/10/2026",
    hours: "09:00 – 15:00",
    venue: "Sảnh Lầu 1",
    status: "Khởi động sự kiện & Nhận đơn sớm",
  },
  {
    day: "Thứ Bảy",
    date: "17/10/2026",
    hours: "09:00 – 15:00",
    venue: "Sảnh Lầu 2",
    status: "Workshop tự xỏ vòng & Trưng bày charm",
  },
  {
    day: "Thứ Hai",
    date: "19/10/2026",
    hours: "11:00 – 15:00",
    venue: "Sảnh Lầu 2",
    status: "Workshop & Trả đơn đặt trước đợt 1",
  },
  {
    day: "Thứ Ba",
    date: "20/10/2026",
    hours: "11:00 – 15:00",
    venue: "Sảnh Lầu 2",
    status: "Ngày hội chính 20/10 • Vòng quay may mắn & Trao quà",
    highlight: true,
  },
];

export const EVENT = {
  dateShort: "16/10 – 20/10",
  dateRange: "16/10 – 20/10/2026",
  mainDate: "20/10/2026",
  mainWeekday: "Thứ Ba",
  mainHours: "11:00 – 15:00",
  mainVenue: "Sảnh Lầu 2",
  campus: "Đại học FPT Hà Nội",
  schedule: EVENT_SCHEDULE,
};
