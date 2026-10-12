import { nanoid } from "nanoid";

interface ISelectElement {
  id: number;
  value: string;
}

const StandardSelectInput = ({
  selectList,
  ...props
}: {
  selectList: ISelectElement[];
}) => {
  return (
    <select
      className="w-full h-12 px-4 rounded-xl border-gray-300 border text-exaltNavy focus:border-exaltNavy focus:ring-exaltNavy"
      {...props}
    >
      {selectList &&
        selectList.map((element: ISelectElement) => (
          <option key={nanoid()} value={element.id}>
            {element.value}
          </option>
        ))}
    </select>
  );
};
export default StandardSelectInput;
