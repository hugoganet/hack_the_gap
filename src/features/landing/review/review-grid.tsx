import { SectionLayout } from "../section-layout";
import type { ReviewItemProps } from "./review-item";
import { ReviewItem } from "./review-item";

type ReviewGridProps = {
  reviews: ReviewItemProps[];
};

export const ReviewGrid = (props: ReviewGridProps) => {
  return (
    <SectionLayout className="m-auto max-w-5xl grid grid-cols-1 gap-4 items-stretch md:grid-cols-2 xl:grid-cols-3">
      {props.reviews.map((review) => (
        <ReviewItem {...review} key={review.image} className="h-full" />
      ))}
    </SectionLayout>
  );
};
