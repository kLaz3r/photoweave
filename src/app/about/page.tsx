"use client";

import { cubicBezier } from "motion";
import { motion } from "motion/react";
import Link from "next/link";
import { FaGithub, FaGlobe, FaLinkedin } from "react-icons/fa";

const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1);

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export default function AboutPage() {
  return (
    <main className="text-text relative flex min-h-screen w-screen max-w-screen flex-col items-center justify-center">
      <div className="container mx-auto mt-[100px] px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          {/* Page Title */}
          <motion.h1
            className="font-display mb-8 text-center text-5xl md:text-7xl"
            variants={fadeUpChild}
          >
            About <span className="text-gradient">PhotoWeave</span>
          </motion.h1>

          {/* About the Application Section */}
          <motion.section className="mb-16" variants={fadeUpChild}>
            <motion.h2
              className="font-display text-primary mb-6 text-3xl md:text-4xl"
              variants={fadeUpChild}
            >
              The application
            </motion.h2>
            <motion.div
              className="prose prose-lg text-text max-w-none"
              variants={fadeUpChild}
            >
              <p className="mb-6 text-lg leading-relaxed md:text-xl">
                This is PhotoWeave, a simple, automatic collage generator. We
                use Face Detection algorithms to crop the photos to fit in the
                layout without cutting out people&apos;s faces automatically.
                You can choose the layout and resolution of the collage, as well
                as the File Type and order of the photos, with a nice and fast
                low res preview of the final collage.
              </p>
              <p className="text-lg leading-relaxed md:text-xl">
                Note that the preview may not be fully representative of the
                final collage as it is rendered at a low resolution to be fast
                and resource efficient, as so, the collage layout may be
                different due to rounding errors in the packing algorithm due to
                the low resolution.
              </p>
            </motion.div>
          </motion.section>

          {/* About the Developer Section */}
          <motion.section className="mb-16" variants={fadeUpChild}>
            <motion.h2
              className="font-display text-primary mb-6 text-3xl md:text-4xl"
              variants={fadeUpChild}
            >
              The developer
            </motion.h2>
            <motion.div
              className="prose prose-lg text-text max-w-none"
              variants={fadeUpChild}
            >
              <p className="mb-6 text-lg leading-relaxed md:text-xl">
                Hello, I am Stefan, a fresh computer science graduate with a
                knack for design and web development, and generally everything
                related to tech and computers. This is my small little app,
                currently in Early stages of development, but planning to
                eventually make into a real, scalable app.
              </p>
              <p className="text-lg leading-relaxed md:text-xl">
                I am currently experimenting and finding out how to architect
                and properly develop a real app, so if you have any feedback,
                feel free to contact me on any of the following platforms:
              </p>
            </motion.div>
          </motion.section>

          {/* Contact Section */}
          <motion.section variants={fadeUpChild}>
            <motion.h3
              className="font-display text-accent mb-8 text-2xl md:text-3xl"
              variants={fadeUpChild}
            >
              Contact me
            </motion.h3>
            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-3"
              variants={staggerContainer}
            >
              <motion.div
                className="bg-background/50 hover:border-accent/30 rounded-2xl border border-white/10 p-8 backdrop-blur-sm transition-all duration-300"
                variants={fadeUpChild}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link
                  href="https://www.linkedin.com/in/stefan-nasturas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <div className="bg-accent/10 group-hover:bg-accent/20 rounded-full p-6 transition-colors duration-300">
                    <FaLinkedin className="text-accent text-4xl" />
                  </div>
                  <h4 className="font-display text-primary text-xl">
                    LinkedIn
                  </h4>
                  <p className="text-accent text-sm opacity-80">
                    stefan-nasturas
                  </p>
                </Link>
              </motion.div>

              <motion.div
                className="bg-background/50 hover:border-accent/30 rounded-2xl border border-white/10 p-8 backdrop-blur-sm transition-all duration-300"
                variants={fadeUpChild}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link
                  href="https://github.com/kLaz3r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <div className="bg-accent/10 group-hover:bg-accent/20 rounded-full p-6 transition-colors duration-300">
                    <FaGithub className="text-accent text-4xl" />
                  </div>
                  <h4 className="font-display text-primary text-xl">GitHub</h4>
                  <p className="text-accent text-sm opacity-80">kLaz3r</p>
                </Link>
              </motion.div>

              <motion.div
                className="bg-background/50 hover:border-accent/30 rounded-2xl border border-white/10 p-8 backdrop-blur-sm transition-all duration-300"
                variants={fadeUpChild}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link
                  href="https://www.stefannasturas.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <div className="bg-accent/10 group-hover:bg-accent/20 rounded-full p-6 transition-colors duration-300">
                    <FaGlobe className="text-accent text-4xl" />
                  </div>
                  <h4 className="font-display text-primary text-xl">
                    Portfolio
                  </h4>
                  <p className="text-accent text-sm opacity-80">
                    stefannasturas.com
                  </p>
                </Link>
              </motion.div>
            </motion.div>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}
