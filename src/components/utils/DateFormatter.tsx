import React, { memo } from "react";
import { Text } from "react-native";
import moment from "moment";

type DateFormatterProps = {
  date: string; // ISO or UTC string
  className?: string; // Optional Tailwind class for styling
};

const DateFormatter: React.FC<DateFormatterProps> = ({
  date,
  className = "text-xs text-gray-500",
}) => {
  if (!date) return null;

  const mDate = moment(date);
  const currentYear = moment().year();
  const isCurrentYear = mDate.year() === currentYear;

  const formatted = isCurrentYear
    ? mDate.format("DD MMM")       // 04 Jun
    : mDate.format("DD MMM YYYY"); // 04 Jun 2023

  return <Text className={className}>{formatted}</Text>;
};

export default memo(DateFormatter);


