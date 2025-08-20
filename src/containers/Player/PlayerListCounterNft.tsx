import { Box, Button, Container, Heading, Text } from "@radix-ui/themes";
import { useFetchCounterNft } from "./useFetchCounterNft";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "react-toastify";
import { PACKAGE_ID } from "../../constants";

export function PlayerListCounterNft() {
  const { data, isLoading, error, refetch } = useFetchCounterNft();
  const { mutate: execCreateCounterNFT } = useSignAndExecuteTransaction();

  return (
    <Container mb={"4"}>
      <Heading size="3" mb="2">
        Counter NFTs
      </Heading>

      {error && <Text>Error: {error.message}</Text>}

      <Box mb="3">
        {data.length > 0 ? (
          data.map((it) => {
            return (
              <Box key={it.data?.objectId}>
                <Text as="div" weight="bold">
                  Object ID:
                </Text>
                <Text as="div">{it.data?.objectId}</Text>
                <Text as="div" weight="bold">
                  Object Type:
                </Text>
                <Text as="div">{it.data?.type}</Text>
              </Box>
            );
          })
        ) : (
          <Text>No CounterNFT Owned</Text>
        )}
      </Box>

      <Button
        disabled={isLoading}
        onClick={() => {
          refetch?.();
        }}
      >
        Refetch CounterNFT
      </Button>

      {!isLoading && data?.length === 0 && (
        <Button
          ml={"3"}
          disabled={isLoading}
          onClick={() => {
            const tx = new Transaction();
            const [counterNft] = tx.moveCall({
              target: `${PACKAGE_ID}::counter_nft::mint`,
            });
            tx.moveCall({
              target: `${PACKAGE_ID}::counter_nft::transfer_to_sender`,
              arguments: [counterNft],
            });

            execCreateCounterNFT(
              {
                transaction: tx,
              },
              {
                onError: (err) => {
                  toast.error(err.message);
                },
                onSuccess: (result) => {
                  toast.success(`Digest: ${result.digest}`);
                  refetch?.();
                },
              },
            );
          }}
        >
          Create CounterNFT
        </Button>
      )}
    </Container>
  );
}
