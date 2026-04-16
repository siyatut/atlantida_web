import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type PublishedReview = {
  name: string;
  createdAt: string;
  rating: number;
  message: string;
};

type ReviewFormValues = {
  name: string;
  rating: number;
  message: string;
};

type ReviewFormErrors = {
  name: string;
  rating: string;
  message: string;
};

type PendingReview = {
  name: string;
  message: string;
  rating: number;
  createdAt: string;
  status: "pending";
};

const REVIEWS: PublishedReview[] = [
  {
    name: "Елена",
    createdAt: "12 марта 2026",
    rating: 5,
    message:
      "Помогли подобрать аквариум и всё оборудование к нему. Очень спокойно объяснили, что действительно нужно, а без чего можно обойтись.",
  },
  {
    name: "Игорь",
    createdAt: "4 марта 2026",
    rating: 5,
    message:
      "Покупаем здесь корма и товары для ухода уже не первый год. Удобно, что можно найти всё в одном месте.",
  },
  {
    name: "Анна",
    createdAt: "21 февраля 2026",
    rating: 4,
    message:
      "Подсказали подходящий корм и аксессуары для кошки. Остались довольны и ассортиментом, и отношением.",
  },
  {
    name: "Елена",
    createdAt: "12 марта 2026",
    rating: 5,
    message:
      "Помогли подобрать аквариум и всё оборудование к нему. Очень спокойно объяснили, что действительно нужно, а без чего можно обойтись.",
  },
];

const INITIAL_FORM_VALUES: ReviewFormValues = {
  name: "",
  rating: 0,
  message: "",
};

function getReviewFormErrors(values: ReviewFormValues): ReviewFormErrors {
  return {
    name: values.name.trim() ? "" : "Введите имя",
    rating: values.rating >= 1 && values.rating <= 5 ? "" : "Выберите оценку",
    message: values.message.trim() ? "" : "Введите текст отзыва",
  };
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 ${filled ? "text-[#F2B84B]" : "text-[#C7D7E5]"}`}
      fill="currentColor"
    >
      <path d="M10 1.9 12.5 7l5.6.8-4 3.9 1 5.5L10 14.6l-5.1 2.6 1-5.5-4-3.9L7.5 7 10 1.9Z" />
    </svg>
  );
}

function RatingStars({
  rating,
  interactive = false,
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const filled = value <= rating;

        if (!interactive || !onSelect) {
          return <StarIcon key={value} filled={filled} />;
        }

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="rounded-md p-0.5 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FC4E7]/50"
            aria-label={`Поставить ${value} ${value === 1 ? "звезду" : value < 5 ? "звезды" : "звёзд"}`}
            aria-pressed={filled}
          >
            <StarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formValues, setFormValues] = useState<ReviewFormValues>(INITIAL_FORM_VALUES);
  const [touchedFields, setTouchedFields] = useState<Record<keyof ReviewFormValues, boolean>>({
    name: false,
    rating: false,
    message: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const formErrors = getReviewFormErrors(formValues);

  useEffect(() => {
    if (!submitSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitSuccess(false);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [submitSuccess]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (hasSubmitted || !formRef.current) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && !formRef.current.contains(target)) {
        setTouchedFields({
          name: false,
          rating: false,
          message: false,
        });
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [hasSubmitted]);

  function setFieldValue<K extends keyof ReviewFormValues>(field: K, value: ReviewFormValues[K]) {
    if (submitSuccess) {
      setSubmitSuccess(false);
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleBlur(field: keyof ReviewFormValues) {
    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const nextTouchedFields = {
      name: true,
      rating: true,
      message: true,
    };
    const nextErrors = getReviewFormErrors(formValues);
    const hasErrors = Object.values(nextErrors).some(Boolean);

    setTouchedFields(nextTouchedFields);

    if (hasErrors) {
      setSubmitSuccess(false);
      return;
    }

    const pendingReview: PendingReview = {
      name: formValues.name.trim(),
      message: formValues.message.trim(),
      rating: formValues.rating,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    console.info("Pending review payload:", pendingReview);

    setFormValues(INITIAL_FORM_VALUES);
    setTouchedFields({
      name: false,
      rating: false,
      message: false,
    });
    setHasSubmitted(false);
    setSubmitSuccess(true);
  }

  const showNameError = (touchedFields.name || hasSubmitted) && !!formErrors.name;
  const showRatingError = (touchedFields.rating || hasSubmitted) && !!formErrors.rating;
  const showMessageError = (touchedFields.message || hasSubmitted) && !!formErrors.message;

  return (
    <main className="bg-white px-6 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-3xl font-semibold leading-snug text-[#234579]">Отзывы</h1>
        <p className="mt-3 max-w-[700px] text-base leading-7 text-[#6B778B]">
          Что говорят о нас клиенты:
        </p>

        <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
          {REVIEWS.map((review) => (
            <article
              key={`${review.name}-${review.createdAt}`}
              className="min-w-[320px] shrink-0 rounded-[24px] border border-[#BCE1F1] bg-[#F6FBFE] p-6 xl:min-w-[calc((100%-3rem)/3)] xl:max-w-[calc((100%-3rem)/3)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold leading-snug text-[#394452]">
                    {review.name}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#8A97AA]">{review.createdAt}</p>
                </div>
                <div className="shrink-0">
                  <RatingStars rating={review.rating} />
                </div>
              </div>
              <p className="mt-5 text-base leading-7 text-[#6B778B]">{review.message}</p>
            </article>
          ))}
        </div>

        <section className="mt-14 rounded-[28px] border border-[#BCE1F1] bg-[#F6FBFE] p-6 shadow-[0_10px_24px_rgba(36,73,124,0.05)] md:p-7">
          <div className="max-w-[760px]">
            <h2 className="text-2xl font-semibold leading-snug text-[#394452]">
              Оставить отзыв
            </h2>
            <p className="mt-3 text-base leading-7 text-[#6B778B]">
              Поделитесь своим опытом — это поможет другим
            </p>
          </div>

          <form
            ref={formRef}
            className="mt-8 grid gap-4 md:max-w-[760px]"
            onSubmit={handleSubmit}
            noValidate
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#5B6880]">Имя</span>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={(event) => setFieldValue("name", event.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Как к вам обращаться"
                aria-invalid={showNameError ? "true" : "false"}
                aria-describedby={showNameError ? "review-name-error" : undefined}
                className="rounded-2xl border border-[#CBE3F1] bg-white px-4 py-2.5 text-sm text-[#394452] outline-none transition-all duration-200 placeholder:text-[#9AA7BA] focus:border-[#7FC4E7] focus:ring-2 focus:ring-[#7FC4E7]/40"
              />
              {showNameError ? (
                <span id="review-name-error" className="text-sm leading-5 text-[#C96565]">
                  {formErrors.name}
                </span>
              ) : null}
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#5B6880]">Оценка</span>
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars
                  rating={formValues.rating}
                  interactive
                  onSelect={(value) => {
                    setFieldValue("rating", value);
                    setTouchedFields((currentTouched) => ({
                      ...currentTouched,
                      rating: true,
                    }));
                  }}
                />
                <span className="text-sm leading-6 text-[#8A97AA]">
                  {formValues.rating ? `${formValues.rating} из 5` : "Выберите оценку"}
                </span>
              </div>
              {showRatingError ? (
                <span id="review-rating-error" className="text-sm leading-5 text-[#C96565]">
                  {formErrors.rating}
                </span>
              ) : null}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#5B6880]">Отзыв</span>
              <textarea
                name="message"
                rows={5}
                value={formValues.message}
                onChange={(event) => setFieldValue("message", event.target.value)}
                onBlur={() => handleBlur("message")}
                placeholder="Расскажите, что вам особенно понравилось"
                aria-invalid={showMessageError ? "true" : "false"}
                aria-describedby={showMessageError ? "review-message-error" : undefined}
                className="resize-none rounded-2xl border border-[#CBE3F1] bg-white px-4 py-3 text-sm leading-6 text-[#394452] outline-none transition-all duration-200 placeholder:text-[#9AA7BA] focus:border-[#7FC4E7] focus:ring-2 focus:ring-[#7FC4E7]/40"
              />
              {showMessageError ? (
                <span id="review-message-error" className="text-sm leading-5 text-[#C96565]">
                  {formErrors.message}
                </span>
              ) : null}
            </label>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2F84BF] px-6 py-3.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(47,132,191,0.2)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#256EAC] hover:shadow-[0_14px_28px_rgba(37,110,172,0.24)]"
              >
                Отправить отзыв
              </button>
              {submitSuccess ? (
                <span className="text-sm leading-6 text-[#5F8F74]">
                  Получили ваш отзыв. Спасибо за оценку!
                </span>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
