import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MapViewTest() {
  return (
    <div className="h-full min-h-screen space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Geographic Spending
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualize your spending patterns across locations and discover insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-3 order-1 lg:order-1">
          <Card className="h-full min-h-[400px] lg:min-h-[500px] border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0 h-full">
              <div className="h-full w-full rounded-xl bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">Map will load here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-4 lg:space-y-6 overflow-y-auto max-h-[400px] lg:max-h-[600px] order-2 lg:order-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Test Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">This is a test version of the MapView component.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
