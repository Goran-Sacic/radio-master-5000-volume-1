import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { RadioBrowserApi } from 'radio-browser-api';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
/* import defaultImg from '../assets/radio_boombox.png'; */
import defaultImg from '../assets/microphone.png';
import styles from './radio.module.scss';
import CircularProgress from '@mui/material/CircularProgress';

/* interface IAppProps {
} */

type Station = {
	changeId: string;
	id: string;
	name: string;
	url: string;
	urlResolved: string;
	homepage: string;
	favicon: string;
	tags: string[];
	country: string;
	countryCode: string;
	state: string;
	language: string[];
	votes: number;
	lastChangeTime: Date;
	codec: string;
	bitrate: number;
	hls: boolean;
	lastCheckOk: boolean;
	lastCheckTime: Date;
	lastCheckOkTime: Date;
	lastLocalCheckTime: Date;
	clickTimestamp: Date;
	clickCount: number;
	clickTrend: number;
	geoLat?: number | null;
	geoLong?: number | null;
};

const Radio: React.FunctionComponent /* <IAppProps> */ = () => {
	const [option, setOption] = useState<'genres' | 'countries'>('genres');

	const [stations, setStations] = useState<Station[] | null>();
	const [countryStations, setCountryStations] = useState<Station[] | null>();
	const [filteredCountryStations, setFilteredCountryStations] = useState<
		Station[] | null
	>();
	const [stationFilter, setStationFilter] = useState('all');
	const [countryFilter, setCountryFilter] = useState('HR');
	const [chosenRadioStation, setChosenRadioStation] = useState('');

	const [activeAudioPlayer, setActiveAudioPlayer] = useState<number | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [currentlyPlaying, setCurrentlyPlaying] = useState<string>('');

	const audioPlayersRef = useRef<(AudioPlayer | null)[]>([]);

	const radioApi = async (stationFilter: string) => {
		setLoading(true);
		setCurrentlyPlaying('nothing yet');
		const api = new RadioBrowserApi('My Radio App');

		const stations: Station[] = await api.searchStations({
			language: 'english',
			tag: stationFilter,
			limit: 30,
			order: 'random',
		});
		setLoading(false);
		setStations(stations);

		return stations;
	};

	useEffect(() => {
		radioApi(stationFilter).then((data) => {
			setStations(data);
		});
	}, [stationFilter]);

	const countryRadioApi = async (countryFilter: string) => {
		setLoading(true);
		setChosenRadioStation('');
		setCurrentlyPlaying('nothing yet');
		const api = new RadioBrowserApi('My Radio App');

		const stations = await api.searchStations({
			countryCode: countryFilter,
			limit: 300,
			order: 'random',
		});

		setFilteredCountryStations(null);
		setCountryStations(stations);
		setLoading(false);
		return stations;
	};

	useEffect(() => {
		countryRadioApi(countryFilter).then((data) => {
			setCountryStations(data);
		});
	}, [countryFilter]);

	const filters: string[] = [
		'all',
		'classical',
		'country',
		'dance',
		'disco',
		'hourse',
		'jazz',
		'pop',
		'rap',
		'retro',
		'rock',
	];

	interface CountryFilter {
		countryCode: string;
		countryName: string;
	}

	const countryFilters: CountryFilter[] = [
		{
			countryCode: 'HR',
			countryName: 'Croatia',
		},
		{
			countryCode: 'SI',
			countryName: 'Slovenia',
		},
		{
			countryCode: 'BA',
			countryName: 'Bosnia and Herzegovina',
		},
		{
			countryCode: 'AT',
			countryName: 'Austria',
		},
		{
			countryCode: 'DE',
			countryName: 'Germany',
		},
		{
			countryCode: 'GB',
			countryName: 'United Kingdom',
		},
		{
			countryCode: 'US',
			countryName: 'United States',
		},
	];

	const setDefaultSrc = (
		event: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		event.currentTarget.src = defaultImg;
	};

	const handleActivePlayer = (index: number) => {
		if (activeAudioPlayer !== null && activeAudioPlayer !== index) {
			audioPlayersRef.current[activeAudioPlayer]?.audio.current?.pause();
		}
		setActiveAudioPlayer(index);
	};

	const handleRadioChange = (event: React.FormEvent<HTMLInputElement>) => {
		const query = event.currentTarget.value.toLowerCase();
		/* setCurrentlyPlaying('nothing yet'); */
		setChosenRadioStation(query);
		const filtered = countryStations?.filter((station) =>
			station.name.toLowerCase().includes(query)
		);
		setFilteredCountryStations(filtered);
	};

	return (
		<>
			<div style={{ padding: '20px', fontSize: '1.5em' }}>
				Browse stations by
			</div>

			<div className={styles.filters}>
				<span
					onClick={() => setOption('genres')}
					className={option === 'genres' ? styles.selected : ''}
				>
					Genres
				</span>
				<span
					onClick={() => setOption('countries')}
					className={option === 'countries' ? styles.selected : ''}
				>
					Countries
				</span>
			</div>
			{option === 'genres' && (
				<div className={styles.radio}>
					<div className={styles.filters}>
						{filters.map((filter, index) => (
							<span
								className={stationFilter === filter ? styles.selected : ''}
								key={index}
								onClick={() => {
									setStationFilter(filter);
									radioApi(filter);
								}}
							>
								{filter}
							</span>
						))}
					</div>
					{loading ? (
						<>
							<CircularProgress size='7rem' />
						</>
					) : (
						<div className={styles.stations}>
							{stations &&
								stations.map((station, index) => {
									return (
										<div className={styles.station} key={index}>
											<div className={styles.stationName}>
												<img
													className={styles.logo}
													src={station.favicon}
													alt='station logo'
													onError={setDefaultSrc}
												/>
												<div className={styles.stationName}>{station.name}</div>
											</div>

											<AudioPlayer
												className={styles.player}
												ref={(el) => (audioPlayersRef.current[index] = el)}
												src={station.urlResolved}
												showJumpControls={false}
												layout='stacked'
												customProgressBarSection={[]}
												customControlsSection={[
													RHAP_UI.MAIN_CONTROLS,
													RHAP_UI.VOLUME_CONTROLS,
												]}
												autoPlayAfterSrcChange={false}
												onPlay={() => {
													handleActivePlayer(index);
													setCurrentlyPlaying(station.name);
												}}
											/>
										</div>
									);
								})}
						</div>
					)}
				</div>
			)}
			{option === 'countries' && (
				<div className={styles.radio}>
					<div className={styles.filters}>
						{countryFilters.map((filter, index) => (
							<span
								className={
									countryFilter === filter.countryCode ? styles.selected : ''
								}
								key={index}
								onClick={() => {
									setCountryFilter(filter.countryCode);
									countryRadioApi(filter.countryCode);

									/* setCountryFilter(filter.countryCode); */
								}}
							>
								{filter.countryName}
							</span>
						))}
					</div>
					{loading ? (
						<>
							<CircularProgress size='7rem' />
						</>
					) : (
						<>
							<div className={styles.inputAndDetails}>
								<div className={styles.inputContainer}>
									<div>Search: </div>
									<input
										className={styles.input}
										onChange={handleRadioChange}
										value={chosenRadioStation}
									/>
								</div>
								<div className={styles.currentlyPlaying}>
									Currently playing:{' '}
									{currentlyPlaying ? currentlyPlaying : 'nothing yet'}
								</div>
							</div>

							{!filteredCountryStations ? (
								<div className={styles.stations}>
									{countryStations &&
										countryStations.map((station, index) => {
											return (
												<div className={styles.station} key={index}>
													<div className={styles.stationName}>
														<img
															className={styles.logo}
															src={station.favicon}
															alt='station logo'
															onError={setDefaultSrc}
														/>
														<div className={styles.stationName}>
															{station.name}
														</div>
													</div>
													<AudioPlayer
														className={styles.player}
														ref={(el) => (audioPlayersRef.current[index] = el)}
														src={station.urlResolved}
														showJumpControls={false}
														layout='stacked'
														customProgressBarSection={[]}
														customControlsSection={[
															RHAP_UI.MAIN_CONTROLS,
															RHAP_UI.VOLUME_CONTROLS,
														]}
														autoPlayAfterSrcChange={false}
														onPlay={() => {
															handleActivePlayer(index);
															setCurrentlyPlaying(station.name);
														}}
													/>
												</div>
											);
										})}
								</div>
							) : (
								<div className={styles.stations}>
									{filteredCountryStations &&
										filteredCountryStations.map((station, index) => {
											return (
												<div className={styles.station} key={index}>
													<div className={styles.stationName}>
														<img
															className={styles.logo}
															src={station.favicon}
															alt='station logo'
															onError={setDefaultSrc}
														/>
														<div className={styles.stationName}>
															{station.name}
														</div>
													</div>
													<AudioPlayer
														className={styles.player}
														ref={(el) => (audioPlayersRef.current[index] = el)}
														src={station.urlResolved}
														showJumpControls={false}
														layout='stacked'
														customProgressBarSection={[]}
														customControlsSection={[
															RHAP_UI.MAIN_CONTROLS,
															RHAP_UI.VOLUME_CONTROLS,
														]}
														autoPlayAfterSrcChange={false}
														onPlay={() => {
															handleActivePlayer(index);
															setCurrentlyPlaying(station.name);
														}}
													/>
												</div>
											);
										})}
								</div>
							)}
						</>
					)}
				</div>
			)}
		</>
	);
};

export default Radio;
