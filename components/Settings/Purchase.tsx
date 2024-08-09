import React, { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

import { Text } from "~/components/ui/text";
import { View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { log, SubscriptionContext } from "~/lib/config";
export default function Purchase() {
  const subscription = useContext(SubscriptionContext);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  // - State for displaying an overlay view
  const [isPurchasing, setIsPurchasing] = useState(false);
  const purchase = async (product: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(product);
      if (typeof customerInfo.entitlements.active.pro !== "undefined") {
        // Unlock that great "pro" content
        log.debug("Pro content unlocked");
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        log.error(e);
      }
    }
  };
  useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        log.error("Error fetching packages", e);
      }
    };

    getPackages();
  }, []);
  return (
    <View className="gap-2 flex-col">
      <Text className="text-l font-semibold text-muted-foreground">
        SUBSCRIPTION
      </Text>

      <View className="flex flex-row gap-5 ">
        {packages.map((product) => (
          <View
            key={product.identifier}
            className="flex-col h-56  bg-secondary rounded-xl flex-1 p-5"
          >
            <View className="flex-1">
              <Text className="text-xl font-semibold">
                {product.product.title}
              </Text>
              <Text>{product.product.description}</Text>
            </View>
            <Text className="text-xl font-semibold">
              {product.product.priceString}
            </Text>

            <Button
              disabled={subscription.sku === product.product.identifier}
              onPress={() => purchase(product)}
            >
              <Text>PURCHASE</Text>
            </Button>
          </View>
        ))}
      </View>
      <Button
        variant="link"
        size="sm"
        onPress={() => {
          Purchases.restorePurchases();
        }}
      >
        <Text>Restore Purchases</Text>
      </Button>
    </View>
  );
}
