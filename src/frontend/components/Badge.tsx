import { css } from "hono/css";
import type { FC, PropsWithChildren } from "hono/jsx";

export const Badge: FC<PropsWithChildren & { class: string }> = (props) => {
	const styles = css`
		.badge {
			margin: 0;
			padding: 8px;
			padding-top: 4px;
			padding-bottom: 4px;
			text-wrap: nowrap;
		}
	`;

	return (
		<div class={styles}>
			<button disabled type="button" class={`badge ${props.class}`}>
				{props.children}
			</button>
		</div>
	);
};
