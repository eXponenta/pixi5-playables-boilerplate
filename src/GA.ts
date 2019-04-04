export class GA {
	static error(e: Error, fatal: boolean = false) {
		//@ts-ignore
		const ga = window.ga;
		if (!ga)
			return;
		ga('send', 'exception', {
			'exDescription': e.message,
			'exFatal': fatal
		});
	}
	static log(kind: string, data: any) {
		//@ts-ignore
		const ga = window.ga;
		if (!ga)
			return;
		ga('send', 'event', {
			eventCategory: kind,
			eventLabel: JSON.stringify(data || "{}")
		});
	}
}
