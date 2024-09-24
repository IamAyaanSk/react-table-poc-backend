export default function getOrderByArray(sortingParams: string) {
  if (!sortingParams) return;
  const initialArray: Record<string, string>[] = [];
  const orderByArray = sortingParams.split(",").reduce((acc, curr) => {
    let [key, value] = [curr.slice(1), curr[0]];
    // validate key
    value = value === "-" ? "desc" : "asc";

    acc.push({
      [key]: value,
    });

    return acc;
  }, initialArray);

  return orderByArray;
}
