import { useState } from "react";
import type { NextPage } from "next";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import { AssetMetadata, ForgeScript, Mint, Transaction } from "@meshsdk/core";

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<Partial<AssetMetadata>>({});
  const [recipient, setRecipient] = useState<string>("");

  async function createEHR() {
    if (wallet) {
      setLoading(true);

      try {
        // Get address from the wallet
        const usedAddress = await wallet.getUsedAddresses();
        const address = usedAddress[0];

        // Create forgingScript
        const forgingScript = ForgeScript.withOneSignature(address);

        const asset: Mint = {
          assetName: 'Careblock',
          assetQuantity: '1',
          metadata: metadata as AssetMetadata,
          label: '721',
          recipient: recipient || address, // Default to own address if recipient not provided
        };

        const tx = new Transaction({ initiator: wallet });
        tx.mintAsset(
          forgingScript,
          asset,
        );

        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        console.log("Transaction hash:", txHash);
      } catch (error) {
        console.error("Error creating EHR:", error);
      }

      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Connect Wallet</h1>
      <CardanoWallet />

      {connected && (
        <>
          <h1>Create EHR</h1>
          <div>
            <label>
              Name: 
              <input
                type="text"
                placeholder="Asset name"
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
          </div>
          <div>
            <label>
              Description: 
              <input
                type="text"
                placeholder="Asset description"
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </label>
          </div>
          <div>
            <label>
              Recipient: 
              <input
                type="text"
                placeholder="Recipient address"
                onChange={(e) => setRecipient(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => createEHR()}
            disabled={loading}
            style={{
              margin: "8px",
              backgroundColor: loading ? "orange" : "grey",
            }}
          >
            {loading ? "Creating..." : "Make EHR"}
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
