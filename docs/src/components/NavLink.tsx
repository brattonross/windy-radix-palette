import { clsx } from "clsx";
import * as React from "react";

export interface NavLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	isActive: boolean;
}

export function NavLink({ isActive, ...props }: NavLinkProps) {
	return (
		<a
			{...props}
			className={clsx(
				"flex",
				"items-center",
				"text-mauve-12",
				"py-2",
				"px-4",
				"bg-transparent",
				"rounded-full",
				"select-none",
				"min-h-6",
				"text-xs",
				"transition-colors",
				"focus:ring-2",
				"focus:ring-violet-7",
				{
					"hover:bg-violet-4 focus:bg-violet-4": !isActive,
					"bg-violet-5": isActive,
				}
			)}
		/>
	);
}
