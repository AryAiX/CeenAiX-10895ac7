import type { Appointment, BlockedSlot, DoctorAvailability } from '../types';

export type OccupiedAppointmentSlot = Pick<Appointment, 'status' | 'scheduled_at' | 'duration_minutes'>;

export interface AvailableTimeSlot {
  iso: string;
  label: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

const OCCUPIED_APPOINTMENT_STATUSES = new Set(['scheduled', 'confirmed', 'in_progress']);

const pad = (value: number) => value.toString().padStart(2, '0');

const parseTime = (value: string) => {
  const [hours = '0', minutes = '0'] = value.split(':');
  return {
    hours: Number(hours),
    minutes: Number(minutes),
  };
};

export const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const buildScheduledAtIso = (date: Date, time: string) => {
  const { hours, minutes } = parseTime(time);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  ).toISOString();
};

const buildDateTime = (date: Date, time: string) => {
  const { hours, minutes } = parseTime(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
};

const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) =>
  startA < endB && endA > startB;

export const generateAvailableTimeSlots = ({
  date,
  availabilities,
  blockedSlots,
  appointments,
}: {
  date: Date;
  availabilities: DoctorAvailability[];
  blockedSlots: BlockedSlot[];
  appointments: OccupiedAppointmentSlot[];
}) => {
  const dateKey = formatDateKey(date);
  const dayOfWeek = date.getDay();
  const now = new Date();
  const relevantAvailabilities = availabilities.filter(
    (availability) => availability.is_active && availability.day_of_week === dayOfWeek
  );

  if (relevantAvailabilities.length === 0) {
    return [] as AvailableTimeSlot[];
  }

  const relevantBlockedSlots = blockedSlots.filter((blockedSlot) => blockedSlot.blocked_date === dateKey);
  const relevantAppointments = appointments.filter((appointment) => {
    if (!OCCUPIED_APPOINTMENT_STATUSES.has(appointment.status)) {
      return false;
    }

    return formatDateKey(new Date(appointment.scheduled_at)) === dateKey;
  });

  const slotMap = new Map<string, AvailableTimeSlot>();

  relevantAvailabilities.forEach((availability) => {
    let cursor = buildDateTime(date, availability.start_time);
    const windowEnd = buildDateTime(date, availability.end_time);

    while (cursor < windowEnd) {
      const slotEnd = new Date(cursor.getTime() + availability.slot_duration_minutes * 60000);

      if (slotEnd > windowEnd) {
        break;
      }

      const isPast = cursor.getTime() <= now.getTime();
      const isBlocked = relevantBlockedSlots.some((blockedSlot) =>
        overlaps(
          cursor,
          slotEnd,
          buildDateTime(date, blockedSlot.start_time),
          buildDateTime(date, blockedSlot.end_time)
        )
      );
      const isBooked = relevantAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.scheduled_at);
        const appointmentEnd = new Date(
          appointmentStart.getTime() + appointment.duration_minutes * 60000
        );

        return overlaps(cursor, slotEnd, appointmentStart, appointmentEnd);
      });

      if (!isPast && !isBlocked && !isBooked) {
        const iso = cursor.toISOString();
        slotMap.set(iso, {
          iso,
          label: cursor.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          startTime: `${pad(cursor.getHours())}:${pad(cursor.getMinutes())}`,
          endTime: `${pad(slotEnd.getHours())}:${pad(slotEnd.getMinutes())}`,
          durationMinutes: availability.slot_duration_minutes,
        });
      }

      cursor = new Date(cursor.getTime() + availability.slot_duration_minutes * 60000);
    }
  });

  return Array.from(slotMap.values()).sort((left, right) => left.iso.localeCompare(right.iso));
};
