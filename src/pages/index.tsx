import { useState } from "react";
import type { NextPage } from "next";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import { AssetMetadata, ForgeScript, Mint, NativeScript, resolveNativeScriptHash, Transaction } from "@meshsdk/core";

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);

  async function createEHR() {
    if (wallet) {
      setLoading(true);
      // use browser wallet to get address
      const usedAddress = await wallet.getUsedAddresses();
      const address = usedAddress[0];

      // create forgingScript
      const forgingScript = ForgeScript.withOneSignature(address);

      const assetMetadata: AssetMetadata = {
        "name": "Mesh Token",
        "image": "ipfs://",
        "mediaType": "image/jpg",
        "description": "This NFT"
      };
      
      const asset: Mint = {
        assetName: 'Careblock',
        assetQuantity: '1',
        metadata: assetMetadata,
        label: '721',
        recipient: '' 
      };

      const tx = new Transaction({ initiator: wallet });
      tx.mintAsset(
        forgingScript,
        asset,
      );
      
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

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
            <button
              type="button"
              onClick={() => createEHR()}
              disabled={loading}
              style={{
                margin: "8px",
                backgroundColor: loading ? "orange" : "grey",
              }}
            >
              Make EHR
            </button>
        </>
      )}
    </div>
  );
};

export default Home;