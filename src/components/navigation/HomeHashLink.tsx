import type { MouseEvent } from "react";
import { Link, type LinkProps, useLocation } from "react-router-dom";
import { scrollToHashTarget } from "../../utils/hash-scroll";

type HomeHashLinkProps = Omit<LinkProps, "to"> & {
  hash: string;
};

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

export default function HomeHashLink({
  hash,
  onClick,
  replace,
  state,
  preventScrollReset,
  relative,
  ...props
}: HomeHashLinkProps) {
  const location = useLocation();
  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedEvent(event) ||
      props.target === "_blank"
    ) {
      return;
    }

    if (location.pathname === "/" && location.hash === normalizedHash) {
      event.preventDefault();
      scrollToHashTarget(normalizedHash, { behavior: "smooth" });
    }
  }

  return (
    <Link
      {...props}
      to={{ pathname: "/", hash: normalizedHash }}
      onClick={handleClick}
      replace={replace}
      state={state}
      preventScrollReset={preventScrollReset}
      relative={relative}
    />
  );
}
