import {
	type CountryCode,
	parsePhoneNumberFromString,
	type PhoneNumber,
} from 'libphonenumber-js/max'

export type { CountryCode }

export interface NormalizedPhone {
	phone: string | null
	formattedPhone: string | null
	isMobile: boolean
	hasWhatsapp: boolean
	whatsappUrl: string | null
	country?: CountryCode
}

function createEmptyNormalizedPhone(): NormalizedPhone {
	return {
		phone: null,
		formattedPhone: null,
		isMobile: false,
		hasWhatsapp: false,
		whatsappUrl: null,
	}
}

export function buildWhatsappUrl(phoneNumber: string): string {
	const cleanedDigits = phoneNumber.replace(/\D/g, '')
	return `https://wa.me/${cleanedDigits}`
}

function parsePhone(
	rawPhone: string,
	defaultCountry?: CountryCode
): PhoneNumber | undefined {
	const trimmedPhone = rawPhone.trim()

	const directParsed = parsePhoneNumberFromString(trimmedPhone, defaultCountry)
	if (directParsed !== undefined && directParsed.isValid()) {
		return directParsed
	}

	if (!trimmedPhone.startsWith('+')) {
		const digitsOnly = trimmedPhone.replace(/\D/g, '')
		if (digitsOnly.length > 0) {
			const parsedWithPlus = parsePhoneNumberFromString(
				`+${digitsOnly}`,
				defaultCountry
			)
			if (parsedWithPlus !== undefined && parsedWithPlus.isValid()) {
				return parsedWithPlus
			}
		}
	}

	return undefined
}

export function normalizePhone(
	rawPhone: string | null | undefined,
	defaultCountry?: CountryCode
): NormalizedPhone {
	if (rawPhone === null || rawPhone === undefined) {
		return createEmptyNormalizedPhone()
	}

	const trimmedPhone = rawPhone.trim()
	if (trimmedPhone.length === 0) {
		return createEmptyNormalizedPhone()
	}

	const parsedPhoneNumber = parsePhone(trimmedPhone, defaultCountry)
	if (parsedPhoneNumber === undefined) {
		return createEmptyNormalizedPhone()
	}

	const numberType = parsedPhoneNumber.getType()
	const isMobile =
		numberType === 'MOBILE' ||
		numberType === 'FIXED_LINE_OR_MOBILE' ||
		numberType === 'PERSONAL_NUMBER'

	const cleanedDigits = parsedPhoneNumber.number.replace(/\D/g, '')

	return {
		phone: parsedPhoneNumber.number,
		formattedPhone: parsedPhoneNumber.formatInternational(),
		isMobile,
		hasWhatsapp: isMobile,
		whatsappUrl: isMobile ? `https://wa.me/${cleanedDigits}` : null,
		country: parsedPhoneNumber.country,
	}
}
