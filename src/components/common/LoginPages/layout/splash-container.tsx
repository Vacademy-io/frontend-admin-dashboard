import { motion } from "framer-motion";
import { LanguageDropdown } from "../../localization/language-dropdown";
import { SplashScreenProps } from "../types";

export const SplashScreen = ({ children, isAnimationEnabled }: SplashScreenProps) => {
    return (
        <div className="flex min-h-screen w-screen bg-white">
            <div className="relative flex w-full items-center justify-center bg-primary-100">
                <motion.div
                    initial={
                        isAnimationEnabled ? { backgroundColor: "#FDEDD7", zIndex: "100" } : {}
                    }
                    animate={
                        isAnimationEnabled
                            ? { backgroundColor: "rgba(255, 255, 255, 0)", zIndex: "auto" }
                            : {}
                    }
                    transition={{
                        duration: 1,
                        delay: 1.25,
                        ease: "easeInOut",
                    }}
                    className="fixed left-0 top-0 h-screen w-screen"
                >
                    <motion.img
                        src="/svgs/ssdc_logo.svg"
                        alt="logo"
                        initial={
                            isAnimationEnabled
                                ? { x: "35vw", y: "25vh", scale: 1 }
                                : { x: 32, y: 32, scale: 0.25 }
                        }
                        animate={
                            isAnimationEnabled
                                ? { x: 32, y: 32, scale: 0.25 }
                                : { x: 32, y: 32, scale: 0.25 }
                        }
                        transition={{
                            duration: 0.75,
                            delay: 1,
                            ease: "easeInOut",
                        }}
                        className="left-8 top-8 size-full max-h-80 max-w-80 origin-top-left object-cover"
                    />
                </motion.div>
                <img src="/images/login-image.png" alt="login image" width={400} height={400} />
            </div>
            <div className="relative flex w-full items-center justify-center text-neutral-600">
                <LanguageDropdown />
                <div className="w-[413px] items-center justify-center">{children}</div>
            </div>
        </div>
    );
};
