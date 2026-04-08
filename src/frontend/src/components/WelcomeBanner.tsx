import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { CouponActor } from "../types/coupon";

export function WelcomeBanner() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!identity || !actor || dismissed) return;
    (actor as unknown as CouponActor)
      .hasCouponBeenUsed("WELCOME")
      .then((used) => {
        setShow(!used);
      })
      .catch(() => {
        // If check fails, don't show banner
      });
  }, [identity, actor, dismissed]);

  if (!identity || dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-b border-pink-200"
          data-ocid="welcome.panel"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <p className="text-sm text-rose-700 font-medium text-center flex-1">
              🎉 Get 5% off on every products !
            </p>
            <button
              type="button"
              onClick={() => {
                setShow(false);
                setDismissed(true);
              }}
              className="text-rose-400 hover:text-rose-600 transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
              data-ocid="welcome.close_button"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
