import { createContext, useContext } from "react";
import { siteContentSchema, type SiteContent } from "@artex/contracts";

export const t = {
  en: {
    nav: {
      home: "Home",
      about: "About Us",
      services: "Services",
      portfolio: "Portfolio",
      values: "Values",
      contact: "Contact",
      cta: "Request a Quote",
      lang: "عربي",
    },
    hero: {
      tagline: "Exhibition Booth & Event Production Specialists",
      headline: "Go Beyond Your Space",
      sub: "We bring your brand vision to life with custom 3D booth designs, structural precision, and end-to-end event execution in Egypt and beyond.",
      cta1: "Explore Portfolio",
      cta2: "Book a Consultation",
    },
    about: {
      label: "Who We Are",
      heading: "Egypt's Premier Production Agency",
      who: "A leading Egyptian company established in Cairo, driven by production professionals creating rare milestones in the exhibition and event industry.",
      what: "We turn business goals into reality — managing every step from initial 3D concept to full structural fabrication and on-site execution.",
      vision:
        "Transform every production challenge into an opportunity for client success and standout brand presence.",
      mission:
        "Elevate market standards by delivering top-tier structural production across trade shows, retail spaces, and branded events.",
      visionLabel: "Our Vision",
      missionLabel: "Our Mission",
    },
    services: {
      label: "What We Build",
      heading: "Core Services",
      items: [
        {
          title: "Exhibition Stall Design & Production",
          desc: "Custom 3D trade show booths and full structural builds tailored to your brand identity and show requirements.",
        },
        {
          title: "Hardware Store & Product Displays",
          desc: "Branded POS units and heavy-duty retail product display structures engineered for maximum impact.",
        },
        {
          title: "Storefront Design & Production",
          desc: "Architectural retail facades, banners, and store signage that command attention and reinforce brand presence.",
        },
        {
          title: "Display Booths & Kiosks",
          desc: "Modular, indoor, and outdoor branded kiosks built for durability and seamless brand experience.",
        },
        {
          title: "Event Styling & Branding",
          desc: "Outdoor venue restyling, backdrop setups, and seasonal décor — from Ramadan tents to back-to-school activations.",
        },
      ],
    },
    showreel: {
      label: "Inside Artex",
      heading: "Watch Ideas Take Shape",
      sub: "A closer look at the craft, precision, and energy behind every Artex production.",
      playLabel: "Open preview",
      items: [
        {
          title: "Exhibition experiences",
          desc: "Immersive spaces designed to make brands impossible to overlook.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
        {
          title: "From workshop to venue",
          desc: "Every structure is prepared, finished, and installed with precision.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
        {
          title: "Retail environments",
          desc: "Purpose-built displays that turn products into memorable experiences.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
      ],
    },
    values: {
      label: "Our Pillars",
      heading: "What Drives Us",
      items: [
        {
          title: "Commitment",
          desc: "Punctual delivery and flawless execution on every project, every time.",
        },
        {
          title: "Innovation",
          desc: "Pioneering spatial and structural concepts that push creative boundaries.",
        },
        {
          title: "Customer-Focused",
          desc: "Custom solutions crafted to align precisely with your brand goals.",
        },
        {
          title: "High Performance",
          desc: "Robust material selection and efficient flow management for lasting results.",
        },
        {
          title: "Quality",
          desc: "Flawless finishing and master craftsmanship in every detail.",
        },
      ],
    },
    portfolio: {
      label: "Our Work",
      heading: "Selected Projects",
      categories: [
        "All",
        "Exhibition Booths",
        "Outdoor & Events",
        "Retail & Kiosks",
      ],
    },
    clients: {
      label: "Trusted By",
      heading: "Brands We've Served",
    },
    contact: {
      label: "Get In Touch",
      heading: "Start Your Project",
      address:
        "Moassest Al Zakkah St, Al Moslya station, in front of Nour El Hoda Center, Cairo, Egypt",
      contactsHeading: "Direct Contacts",
      formHeading: "Send Us a Message",
      fields: {
        name: "Full Name",
        company: "Company Name",
        service: "Service Needed",
        serviceOptions: [
          "Select a service...",
          "Exhibition Stall Design",
          "Product Displays",
          "Storefront Design",
          "Display Booths & Kiosks",
          "Event Styling",
          "Other",
        ],
        budget: "Budget Range",
        budgetOptions: [
          "Select budget...",
          "Under EGP 50,000",
          "EGP 50K – 150K",
          "EGP 150K – 500K",
          "EGP 500K+",
        ],
        message: "Project Details",
        send: "Send Message",
      },
      whatsapp: "Chat on WhatsApp",
      facebook: "Follow on Facebook",
    },
    footer: {
      rights: "© 2025 Artex Production. All rights reserved.",
      tagline: "Go Beyond Your Space",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "عن الشركة",
      services: "خدماتنا",
      portfolio: "أعمالنا",
      values: "قيمنا",
      contact: "تواصل معنا",
      cta: "احصل على عرض سعر",
      lang: "English",
    },
    hero: {
      tagline: "متخصصون في تصميم وتنفيذ بوثات المعارض وإدارة الفعاليات",
      headline: "تخطّى حدود المساحة",
      sub: "نحول رؤية علامتك التجارية إلى واقع من خلال تصميم وتنفيذ بوثات المعارض وتجهيز الفعاليات بأعلى معايير الجودة.",
      cta1: "استعرض أعمالنا",
      cta2: "احجز استشارة",
    },
    about: {
      label: "من نحن",
      heading: "الوكالة الرائدة في مصر",
      who: "شركة مصرية رائدة مقرها القاهرة، يقودها محترفون في مجال الإنتاج يصنعون إنجازات استثنائية في صناعة المعارض والفعاليات.",
      what: "نحول الأهداف التجارية إلى واقع ملموس — من التصور ثلاثي الأبعاد الأولي حتى التصنيع الهيكلي الكامل والتنفيذ في الموقع.",
      vision:
        "تحويل كل تحدي في الإنتاج إلى فرصة لنجاح العميل وحضور علامة تجارية متميز.",
      mission:
        "رفع معايير السوق من خلال تقديم إنتاج هيكلي عالي الجودة في المعارض التجارية والمساحات البيعية والفعاليات.",
      visionLabel: "رؤيتنا",
      missionLabel: "مهمتنا",
    },
    services: {
      label: "ما نبنيه",
      heading: "خدماتنا الأساسية",
      items: [
        {
          title: "تصميم وتنفيذ جناح المعارض",
          desc: "بوثات معارض تجارية مخصصة وتصاميم هيكلية كاملة مصممة خصيصاً لهويتك وفعاليتك.",
        },
        {
          title: "منصات عرض المنتجات للمتاجر",
          desc: "وحدات بيع مميزة ومنصات عرض منتجات هندسية مدروسة لأقصى تأثير بصري.",
        },
        {
          title: "تصميم وتنفيذ واجهات المحلات",
          desc: "واجهات بيع معمارية ولافتات متاجر تستقطب الأنظار وتعزز الحضور المؤسسي.",
        },
        {
          title: "بوثات العرض وأكشاك البيع",
          desc: "أكشاك مرنة داخلية وخارجية مبنية للمتانة وتجربة علامة تجارية سلسة.",
        },
        {
          title: "تجهيز وتصميم الفعاليات",
          desc: "إعادة تصميم أماكن خارجية وخلفيات تصوير وديكورات موسمية — من خيام رمضان إلى فعاليات العودة للمدارس.",
        },
      ],
    },
    showreel: {
      label: "داخل آرتكس",
      heading: "شاهد الأفكار تتحول إلى واقع",
      sub: "نظرة أقرب على الحرفية والدقة والطاقة وراء كل مشروع من آرتكس.",
      playLabel: "فتح العرض",
      items: [
        {
          title: "تجارب المعارض",
          desc: "مساحات غامرة مصممة لتجعل العلامات التجارية محط الأنظار.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
        {
          title: "من الورشة إلى الموقع",
          desc: "يتم تجهيز وتشطيب وتركيب كل هيكل بأعلى درجات الدقة.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
        {
          title: "بيئات البيع بالتجزئة",
          desc: "منصات عرض مصممة خصيصاً لتحويل المنتجات إلى تجارب لا تُنسى.",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format",
          videoUrl: "",
        },
      ],
    },
    values: {
      label: "ركائزنا",
      heading: "ما يحرّكنا",
      items: [
        {
          title: "الالتزام",
          desc: "التسليم في الموعد المحدد والتنفيذ المثالي في كل مشروع وفي كل مرة.",
        },
        {
          title: "الابتكار",
          desc: "مفاهيم مكانية وهيكلية رائدة تدفع حدود الإبداع.",
        },
        {
          title: "التركيز على العميل",
          desc: "حلول مخصصة مصممة لتتوافق تماماً مع أهداف علامتك التجارية.",
        },
        {
          title: "الأداء العالي",
          desc: "اختيار دقيق للمواد وإدارة فعّالة للتدفق لنتائج دائمة.",
        },
        { title: "الجودة", desc: "تشطيب عالٍ وحرفية متقنة في كل التفاصيل." },
      ],
    },
    portfolio: {
      label: "أعمالنا",
      heading: "مشاريع مختارة",
      categories: [
        "الكل",
        "بوثات المعارض",
        "فعاليات خارجية",
        "واجهات ومنافذ بيع",
      ],
    },
    clients: {
      label: "يثقون بنا",
      heading: "علامات تجارية عملنا معها",
    },
    contact: {
      label: "تواصل معنا",
      heading: "ابدأ مشروعك",
      address:
        "شارع مؤسسة الزكاة - محطة المصلي - أمام مركز نور الهوى - القاهرة - مصر",
      contactsHeading: "تواصل مباشر",
      formHeading: "أرسل لنا رسالة",
      fields: {
        name: "الاسم الكامل",
        company: "اسم الشركة",
        service: "الخدمة المطلوبة",
        serviceOptions: [
          "اختر الخدمة...",
          "تصميم جناح المعارض",
          "منصات عرض المنتجات",
          "تصميم الواجهات",
          "بوثات وأكشاك",
          "تجهيز الفعاليات",
          "أخرى",
        ],
        budget: "الميزانية التقديرية",
        budgetOptions: [
          "اختر الميزانية...",
          "أقل من 50,000 جنيه",
          "50K – 150K جنيه",
          "150K – 500K جنيه",
          "أكثر من 500K جنيه",
        ],
        message: "تفاصيل المشروع",
        send: "إرسال الرسالة",
      },
      whatsapp: "تواصل عبر واتساب",
      facebook: "تابعنا على فيسبوك",
    },
    footer: {
      rights: "© 2025 آرتكس برودكشن. جميع الحقوق محفوظة.",
      tagline: "تخطّى حدود المساحة",
    },
  },
} as const;

export const SiteContentContext = createContext<SiteContent>(
  siteContentSchema.parse(t),
);
export function useSiteCopy(locale: "ar" | "en") {
  return useContext(SiteContentContext)[locale];
}
export type TranslationContent = typeof t.en;
export function useSiteSettings() {
  return useContext(SiteContentContext).settings;
}
