const QuantityInput = ({...props}) => {
  return (
    <input type="number" { ...props } className="w-full h-12 px-4 rounded-xl bg-white border-gray-300 border text-exaltNavy focus:border-exaltNavy focus:ring-exaltNavy" placeholder="Quantité" />
  )
}
export default QuantityInput