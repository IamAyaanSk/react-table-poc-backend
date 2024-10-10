export default function getOrderByArray(sortingParams: string[]) {
  const initialArray: Record<string, string>[] = [];
  const orderByArray = sortingParams.reduce((acc, curr) => {
    let [key, value] = curr.split("-");

    acc.push({
      [key]: value,
    });

    return acc;
  }, initialArray);

  return orderByArray;
}
