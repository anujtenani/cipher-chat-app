import { Image } from "expo-image";
function RenderCountryFlag({ countryCode }: { countryCode: string }) {
  if (!countryCode) {
    return null;
  }
  const code = countryCode.toUpperCase();
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  return (
    <Image
      source={{ uri: flagUrl }}
      style={{
        width: 20,
        height: 15,
        borderRadius: 4,
        overflow: "hidden",
        marginRight: 4,
      }}
      contentFit="cover"
      contentPosition={"center"}
    />
  );
}
export default RenderCountryFlag;
