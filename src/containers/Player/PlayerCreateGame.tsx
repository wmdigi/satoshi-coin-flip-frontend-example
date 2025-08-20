import { useContext, useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Box,
  Container,
  Heading,
  TextFieldInput,
  Text,
  Button,
} from "@radix-ui/themes";
import { toast } from "react-toastify";
import { MIST_PER_SUI } from "@mysten/sui/utils";

import { PACKAGE_ID } from "../../constants";
import { useFetchCounterNft } from "./useFetchCounterNft";
import { HouseDataContext } from "../House/HouseDataContext";

export function PlayerCreateGame() {
  const { mutate: execCreateGame, isLoading } =
    useSignAndExecuteTransaction();
  const { data: counterNFTData } = useFetchCounterNft();

  const [guess, setGuess] = useState("");
  const [stake, setStake] = useState(0);

  const [houseDataId] = useContext(HouseDataContext);

  return (
    <Container mb={"4"}>
      <Heading size="3" mb="2">
        Create Game
      </Heading>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          // Create new transaction block
          const tx = new Transaction();

          // Player stake
          const [stakeCoin] = tx.splitCoins(tx.gas, [
            MIST_PER_SUI * BigInt(stake),
          ]);

          // Create the game with CounterNFT
          tx.moveCall({
            target: `${PACKAGE_ID}::single_player_satoshi::start_game`,
            arguments: [
              tx.pure.string(guess),
              tx.object(counterNFTData[0].data?.objectId!),
              stakeCoin,
              tx.object(houseDataId),
            ],
          });

          execCreateGame(
            {
              transaction: tx,
            },
            {
              onError: (err) => {
                toast.error(err.message);
              },
              onSuccess: (result) => {
                toast.success(`Digest: ${result.digest}`);
              },
            },
          );
        }}
      >
        <Box mb="3">
          <Text>Guess</Text>
          <TextFieldInput
            required
            placeholder="Guess (H or T)"
            onChange={(e) => {
              setGuess(e.target.value);
            }}
          />
        </Box>

        <Box mb="3">
          <Text>Stake</Text>
          <TextFieldInput
            required
            placeholder="Stake (in SUI)"
            onChange={(e) => {
              setStake(Number(e.target.value));
            }}
          />
        </Box>

        <Button
          disabled={isLoading || counterNFTData.length <= 0}
          type="submit"
        >
          Create Game
        </Button>
      </form>
    </Container>
  );
}
