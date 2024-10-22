import { CSSProperties, memo, ReactEventHandler, UIEventHandler, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Taskbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import AppsManager from "../../features/apps/appsManager";
import { ReactSVG } from "react-svg";
import { HomeMenu } from "./menus/HomeMenu";
import OutsideClickListener from "../../hooks/_utils/outsideClick";
import { Battery } from "./indicators/Battery";
import { Network } from "./indicators/Network";
import { Volume } from "./indicators/Volume";
import { SearchMenu } from "./menus/SearchMenu";
import { Calendar } from "./indicators/Calendar";
import { useScrollWithShadow } from "../../hooks/_utils/scrollWithShadows";
import { AppButton } from "./app-icon/AppIcon";
import { useContextMenu } from "../../hooks/modals/contextMenu";
import { Actions } from "../actions/Actions";
import { ClickAction } from "../actions/actions/ClickAction";
import { APPS, APP_NAMES } from "../../config/apps.config";
import { useWindowsManager } from "../../hooks/windows/windowsManagerContext";
import { TASKBAR_HEIGHT } from "../../config/taskbar.config";
import { useSettingsManager } from "../../hooks/settings/settingsManagerContext";
import { SettingsManager } from "../../features/settings/settingsManager";
import { useWindows } from "../../hooks/windows/windowsContext";
import { ZIndexManager } from "../../features/z-index/zIndexManager";
import { useZIndex } from "../../hooks/z-index/zIndex";

export const Taskbar = memo(() => {
	const ref = useRef(null);
	const settingsManager = useSettingsManager();
	const [showHome, setShowHome] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [hideUtilMenus, setHideUtilMenus] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { boxShadow, onUpdate } = useScrollWithShadow({ ref, shadow: {
		offset: 20,
		blurRadius: 10,
		spreadRadius: -10,
		color: { a: 25 }
	} });
	const inputRef = useRef(null);
	const windowsManager = useWindowsManager();
	const windows = useWindows();
	const { onContextMenu } = useContextMenu({ Actions: (props) =>
		<Actions avoidTaskbar={false} {...props}>
			<ClickAction label={`Open ${APP_NAMES.SETTINGS}`} icon={faCog} onTrigger={() => {
				windowsManager.open(APPS.SETTINGS);
			}}/>
		</Actions>
	});
	const [pins, setPins] = useState([]);
	const zIndex = useZIndex({ groupIndex: ZIndexManager.GROUPS.TASKBAR, index: 0 });

	const apps = useMemo(() => AppsManager.APPS.sort((appA, appB) => {
		const indexA = pins.indexOf(appA.id);
		const indexB = pins.indexOf(appB.id);
		if (indexA < 0 && indexB > 0) {
			return 1;
		} else if (indexA > 0 && indexB < 0) {
			return -1;
		} else if (indexA < 0 && indexB < 0) {
			return 0;
		} else {
			return indexA - indexB;
		}
	}).map((app) => {
		const isActive = windows.map((window) => window.app.id).includes(app.id);
		const shouldBeShown = (pins.includes(app.id) || isActive);
		return (<AppButton
			windowsManager={windowsManager}
			pins={pins}
			app={app} 
			key={app.id}
			active={isActive}
			visible={shouldBeShown}
		/>);
	}), [pins, windows, windowsManager]);

	useEffect(() => {
		const settings = settingsManager.get(SettingsManager.VIRTUAL_PATHS.taskbar);
		void settings.get("pins", (pins) => {
			setPins(pins.split(","));
		});
	}, [settingsManager]);

	const updateShowHome = (show: boolean) => {
		setShowHome(show);

		if (show) {
			setShowSearch(false);
			setHideUtilMenus(true);
		}
	};

	const updateShowSearch = (show: boolean) => {
		setShowSearch(show);

		if (show) {
			if (searchQuery !== "") {
				setSearchQuery("");
			}

			setShowHome(false);
			setHideUtilMenus(true);
			
			if (inputRef.current) {
				(inputRef.current as HTMLElement).focus();
				window.scrollTo(0, document.body.scrollHeight);
			}
		} else {
			setTimeout(() => {
				if (!showSearch) {
					setSearchQuery("");
				}
			}, 200);
		}
	};

	const showUtilMenu = () => {
		setShowHome(false);
		setShowSearch(false);
		setHideUtilMenus(false);
	};

	const search = (_query: string) => {
		updateShowSearch(true);
	};

	return (<>
		<div
			style={{ "--taskbar-height": `${TASKBAR_HEIGHT}px`, zIndex } as CSSProperties}
			className={styles.Taskbar}
			data-allow-context-menu={true}
			onContextMenu={(event) => {
				if ((event.target as HTMLElement).getAttribute("data-allow-context-menu"))
					onContextMenu(event);
			}}
		>
			<div className={styles.MenuIcons}>
				<div className={styles.HomeContainer}>
					<OutsideClickListener onOutsideClick={() => { updateShowHome(false); }}>
						<button
							title="Home"
							tabIndex={0}
							className={`${styles.MenuButton} ${styles.HomeButton}`}
							onClick={() => { updateShowHome(!showHome); }}
						>
							<ReactSVG src={"/icon.svg"}/>
						</button>
						<HomeMenu active={showHome} setActive={updateShowHome} search={search}/>
					</OutsideClickListener>
				</div>
				<div className={styles.SearchContainer}>
					<OutsideClickListener onOutsideClick={() => { updateShowSearch(false); }}>
						<button
							title="Search"
							tabIndex={0}
							className={styles.MenuButton}
							onClick={() => { updateShowSearch(!showSearch); }}
						>
							<FontAwesomeIcon icon={faSearch}/>
						</button>
						<SearchMenu
							active={showSearch}
							setActive={updateShowSearch}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							inputRef={inputRef}
						/>
					</OutsideClickListener>
				</div>
			</div>
			<div className={styles.AppIconsContainer} data-allow-context-menu={true} style={{ boxShadow }}>
				<div
					className={styles.AppIcons}
					data-allow-context-menu={true}
					onScroll={onUpdate as unknown as UIEventHandler}
					onResize={onUpdate as unknown as ReactEventHandler}
					ref={ref}
				>
					{apps}
				</div>
			</div>
			<div className={styles.UtilIcons}>
				<Battery showUtilMenu={showUtilMenu} hideUtilMenus={hideUtilMenus}/>
				<Network showUtilMenu={showUtilMenu} hideUtilMenus={hideUtilMenus}/>
				<Volume showUtilMenu={showUtilMenu} hideUtilMenus={hideUtilMenus}/>
				<Calendar showUtilMenu={showUtilMenu} hideUtilMenus={hideUtilMenus}/>
				<button title="Show Desktop" id="desktop-button" onClick={() => { windowsManager.minimizeAll(); }}/>
			</div>
		</div>
	</>);
});