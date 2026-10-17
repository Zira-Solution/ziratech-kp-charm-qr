"use client";

import type { GiftTemplate } from "@/components/gift-templates/template-contract";
import { defaultSlides } from "@/components/gift-templates/template-contract";
import StorybookSlide from "./StorybookSlide";

export const STORYBOOK_TEMPLATE: GiftTemplate = {
  id: "storybook-sunset",
  slides: defaultSlides,
  render: (slide, gift, ctx) => (
    <StorybookSlide
      key={slide.id}
      slide={slide}
      gift={gift}
      ctx={ctx}
      slides={defaultSlides(gift)}
    />
  ),
};

export default STORYBOOK_TEMPLATE;
