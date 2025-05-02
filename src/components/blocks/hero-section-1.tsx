'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faCalendarAlt,
  faTachometerAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { cn } from '@/utils/util';
import { useRouter } from 'next/navigation';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.6,
      },
    },
  },
};

export function HeroSection() {
  const router = useRouter();

  type OptionType = 'Upload' | 'Events' | 'Dashboard' | 'Attendees';
  const options = React.useMemo<OptionType[]>(
    () => ['Upload', 'Events', 'Dashboard', 'Attendees'],
    []
  );

  const [selectedOption, setSelectedOption] = React.useState<OptionType>('Upload');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSelectedOption(currentOption => {
        const currentIndex = options.indexOf(currentOption);
        const nextIndex = (currentIndex + 1) % options.length;
        return options[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [options]);

  const optionIcons = {
    Upload: faUpload,
    Events: faCalendarAlt,
    Dashboard: faTachometerAlt,
    Attendees: faUsers,
  };

  const optionImages: Record<OptionType, string> = {
    Upload: '/uploads.png',
    Events: '/events.png',
    Dashboard: '/home1.svg',
    Attendees: '/users.svg',
  };

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="absolute inset-0 -z-20"
            >
              <div className="h-full"></div>
            </AnimatedGroup>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <h1 className="mt-8 max-w-4xl mx-auto text-balance font-normal text-5xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Unlock Insights from your Luma Events
                  </h1>
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-md opacity-70">
                    Lumalytics transforms your post-event CSVs into rich, actionable analytics. Go
                    beyond basic stats and understand your attendees like never before.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-row items-center justify-center gap-2 md:flex-row"
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-3 md:px-5  text-base bg-white text-black"
                  >
                    <Link href="https://lumalytics.mintlify.app/introduction" target="_blank">
                      <span className="text-nowrap">Read Docs</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-3 md:px-5 text-base bg-black text-white"
                  >
                    <div className="cursor-pointer" onClick={() => router.push('/auth/login')}>
                      <span className="text-nowrap">Get Started</span>
                    </div>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.02,
                      delayChildren: 0.5,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="hidden md:flex items-center justify-center mt-8">
                <div className="inline-flex bg-white/70 backdrop-blur-md rounded-lg shadow-sm px-6 py-2 gap-2">
                  {options.map(option => (
                    <div
                      key={option}
                      className={cn(
                        'px-4 py-2 cursor-pointer relative',
                        'transition-colors duration-200 ease-in-out',
                        selectedOption === option
                          ? 'text-white bg-luma-blue rounded-lg'
                          : 'text-gray-700 hover:bg-luma-red rounded-lg'
                      )}
                      onClick={() => setSelectedOption(option)}
                    >
                      <FontAwesomeIcon icon={optionIcons[option]} className="mr-2" />
                      {option}
                      {selectedOption === option && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-auto w-3/4 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto mt-8 px-4 sm:px-6 md:mt-12 lg:mt-16 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw]">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto overflow-hidden rounded-xl border shadow-lg shadow-zinc-950/15 ring-1">
                  <div className="max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-hidden">
                    <Image
                      className="bg-background w-full h-auto aspect-auto relative hidden dark:block object-contain transition-opacity duration-300"
                      src={optionImages[selectedOption] || '/home1.svg'}
                      alt={`${selectedOption} screen`}
                      width={1200}
                      height={800}
                    />
                    <Image
                      className="z-2 border-border/25 w-full h-auto aspect-auto relative border dark:hidden object-contain transition-opacity duration-300"
                      src={optionImages[selectedOption] || '/home1.svg'}
                      alt={`${selectedOption} screen`}
                      width={1200}
                      height={800}
                    />
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <p className="flex justify-center text-muted-foreground font-bold">Made by Luma Hosts</p>
          <p className="flex justify-center text-muted-foreground font-bold">
            for Luma Hosts with ❤️
          </p>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: 'Documentation', href: 'https://lumalytics.mintlify.app/introduction' },
  { name: 'About', href: '/' },
];

export const HeroHeader = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled] = React.useState(true);
  const router = useRouter();
  return (
    <header>
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 lg:px-12',
            isScrolled &&
              'bg-black/5 max-w-4xl rounded-2xl backdrop-blur-lg lg:px-5 dark:bg-white/5'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <div
                aria-label="home"
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => router.push('/')}
              >
                <Logo />
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
                className="block p-2.5 lg:hidden"
              >
                {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className=" hover:text-accent-foreground block"
                      target={item.name === 'Documentation' ? '_blank' : undefined}
                    >
                      <span className="text-lg font-semibold">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                'bg-background w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent',
                menuOpen ? 'block mb-6' : 'hidden',
                'lg:flex'
              )}
            >
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block"
                        target={item.name === 'Documentation' ? '_blank' : undefined}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl px-5 py-2 text-base bg-white text-black"
                >
                  <div className="cursor-pointer" onClick={() => router.push('/auth/login')}>
                    <span className="text-nowrap">Login</span>
                  </div>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-xl px-5 py-2 text-base bg-black text-white"
                >
                  <div className="cursor-pointer" onClick={() => router.push('/auth/sign-up')}>
                    <span className="text-nowrap">Sign Up</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return <Image src="/logo.svg" alt="app screen" height={48} width={48} className={className} />;
};
