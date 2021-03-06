import AppError from '@shared/errors/AppError';

import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeNotificationsRepository: FakeNotificationsRepository;
let fakeAppointmentsRepository: FakeAppointmentsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeNotificationsRepository = new FakeNotificationsRepository();
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    createAppointment = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationsRepository,
    );
  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 12).getTime();
    });

    const appointment = await createAppointment.execute({
      date: new Date(2020, 4, 20, 13),
      user_id: '123123',
      provider_id: '321321',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('321321');
  });

  it('should not be able to create two appointments on the same time', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 4, 20, 12).getTime();
    });

    const appointmentDate = new Date(2020, 4, 20, 13);

    await createAppointment.execute({
      date: appointmentDate,
      user_id: '123123',
      provider_id: '321321',
    });

    await expect(
      createAppointment.execute({
        date: appointmentDate,
        user_id: '123123',
        provider_id: '321321',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 20, 11),
        user_id: '123123',
        provider_id: '321321',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 20, 13),
        user_id: '123123',
        provider_id: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 21, 7),
        user_id: '123123',
        provider_id: '321321',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 21, 18),
        user_id: '123123',
        provider_id: '321321',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
