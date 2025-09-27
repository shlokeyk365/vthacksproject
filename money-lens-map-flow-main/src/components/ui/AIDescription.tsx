import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIDescriptionProps {
  shortDescription: string;
  longDescription: string;
  insights?: string[];
  className?: string;
}

export function AIDescription({ 
  shortDescription, 
  longDescription, 
  insights = [], 
  className = "" 
}: AIDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`mt-4 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-primary text-sm">AI Analysis</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
              >
                {isExpanded ? (
                  <>
                    <span className="mr-1">Less</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span className="mr-1">More</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-foreground mb-2">{shortDescription}</p>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-primary/20 pt-3">
                    <p className="text-sm text-foreground mb-3">{longDescription}</p>
                    
                    {insights.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-primary">Key Insights:</h5>
                        <ul className="space-y-1">
                          {insights.map((insight, index) => (
                            <li key={index} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
