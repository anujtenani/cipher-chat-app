import { useAuth } from "@/hooks/useAuth";
import { TurnBasedGameState } from "@/utils/api_types";
import { View } from "react-native";
import ScaleInPressable from "../ScaleInPressable";
import { ThemedView } from "../themed-view";
import ThemedButton from "../ui/ThemedButton";
import { ThemedText } from "../ui/ThemedText";

export default function TurnBasedStoryComponent({
  data,
}: {
  data: TurnBasedGameState["data"];
}) {
  //   console.log({ data });
  const lastMessage = data.history[data.history.length - 1];
  const selfId = useAuth((state) => state.user?.id);
  const self = data.players.find((p) => p.id === selfId);
  if (!self) return null;
  const haveAllAccepted = data.players.every(
    (p) => p.accepted_at && p.accepted_at > 0
  );
  const isItMyTurn = data.currentTurn == selfId;
  const doINeedToTakeAction = self.accepted_at <= 0;
  return (
    <ThemedView>
      <ThemedText>{data.title}</ThemedText>
      <ThemedText>
        {data.history
          .slice(0, data.history.length - 1)
          .map((entry) => entry.content)
          .join(" ")}
        <ThemedText style={{ fontWeight: "bold" }}>
          {lastMessage.content}
        </ThemedText>
      </ThemedText>
      {doINeedToTakeAction ? (
        <GameAcceptRejectPanel></GameAcceptRejectPanel>
      ) : (
        <>
          {haveAllAccepted ? (
            <>
              {isItMyTurn ? (
                <ChooseAnOption data={data}></ChooseAnOption>
              ) : (
                <WaitingForTurn></WaitingForTurn>
              )}
            </>
          ) : (
            <WaitingForOtherPlayersPanel></WaitingForOtherPlayersPanel>
          )}
        </>
      )}
    </ThemedView>
  );
}
function ChooseAnOption({ data }: { data: TurnBasedGameState }) {
  return (
    <ThemedView style={{ marginLeft: 12, marginTop: 8 }}>
      <ThemedText>Choose an option</ThemedText>
      {data.options.map((i) => {
        return (
          <ScaleInPressable
            key={i.option}
            style={{
              // padding: 8,
              marginVertical: 4,
              borderRadius: 8,
            }}
          >
            <ThemedText>{i.option}</ThemedText>
          </ScaleInPressable>
        );
      })}
    </ThemedView>
  );
}

function WaitingForTurn() {
  return <ThemedText>Waiting for other players to take their turn</ThemedText>;
}

function WaitingForOtherPlayersPanel() {
  return (
    <ThemedText>Waiting for other players to accept the game invite</ThemedText>
  );
}

function GameAcceptRejectPanel() {
  return (
    <ThemedView>
      <ThemedText>Do you want to craft this experience</ThemedText>
      <View>
        <ThemedButton title="Accept"></ThemedButton>
        <ThemedButton title="Reject"></ThemedButton>
      </View>
    </ThemedView>
  );
}
