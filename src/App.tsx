import styles from './App.module.scss';
import Radio from './components/radio';

function App() {
	return (
		<>
			<div className={styles.App}>
				<h1>Radio Master 5000, Volume 1</h1>
				<h2>
					Welcome to Radio Master 5000! Browse radios by genre or by various
					countries & enjoy some good music!
				</h2>
				<Radio />
			</div>
		</>
	);
}

export default App;
