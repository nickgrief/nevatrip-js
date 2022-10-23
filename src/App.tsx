import { v4 as ukey } from 'uuid';
import React, { useCallback, useMemo, useState } from 'react';

const AtoB = [
    '2021-08-21 18:00:00',
    '2021-08-21 18:30:00',
    '2021-08-21 18:45:00',
    '2021-08-21 19:00:00',
    '2021-08-21 19:15:00',
    '2021-08-21 21:00:00',
];

const BtoA = [
    '2021-08-21 18:30:00',
    '2021-08-21 18:45:00',
    '2021-08-21 19:00:00',
    '2021-08-21 19:15:00',
    '2021-08-21 19:35:00',
    '2021-08-21 21:50:00',
    '2021-08-21 21:55:00',
];

enum Types {
    'из A в B',
    'из B в A',
    'из A в B и обратно в А',
}

const tripsToA = BtoA.map((trip, index) => {
    return {
        date: new Date(trip),
        index: index,
    };
});
const tripsToB = AtoB.map((trip, index) => {
    return {
        date: new Date(trip),
        index: index,
    };
});

const timeSingleMilliseconds = 50 * 60000;

const priceSingle = 700;
const priceRound = 1200;

function App() {
    const [type, setType] = useState(Types[0]);
    const [fromATrip, setFromATrip] = useState(tripsToB[0].date);
    const [fromBTrip, setFromBTrip] = useState(tripsToA[0].date);
    const [ticketCount, setTicketCount] = useState(0);
    const [showCalculation, setShowCalculation] = useState(false);

    const onTypeSelect = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            switch (event.target.value) {
                case 'из A в B':
                    setType(Types[0]);
                    break;
                case 'из B в A':
                    setType(Types[1]);
                    break;
                case 'из A в B и обратно в А':
                    setType(Types[2]);
                    break;
                default:
                    console.log('Mismatch');
                    break;
            }
            setFromATrip(tripsToB[0].date);
            setFromBTrip(tripsToA[0].date);
            setTicketCount(0);
            setShowCalculation(false);
        },
        []
    );

    const onStartSelect = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            let [from, index] = event.target.value.split(' ');
            if (from === 'A') {
                setFromATrip(tripsToB[Number(index)].date);
                setFromBTrip(
                    tripsToA.filter(
                        ({ date }) =>
                            date.getTime() >
                            tripsToB[Number(index)].date.getTime() +
                                timeSingleMilliseconds
                    )[0].date
                );
            } else {
                setFromBTrip(tripsToA[Number(index)].date);
            }
        },
        [fromATrip, fromBTrip]
    );

    const onTicketCountChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            let value = Math.abs(Number(event.target.value));
            setTicketCount(value);
        },
        []
    );

    const onCalculateButtonClick = useCallback(() => {
        if (ticketCount) {
            setShowCalculation(true);
        }
    }, [ticketCount]);

    const fromATrips = useMemo(() => {
        return tripsToB.map(({ date, index }) => {
            return (
                <option key={ukey()} value={`A ${index}`}>
                    {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    })}{' '}
                    (из A в B)
                </option>
            );
        });
    }, [tripsToB]);

    const fromBTrips = useMemo(() => {
        return tripsToA.map(({ date, index }) => {
            return (
                <option key={ukey()} value={`B ${index}`}>
                    {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    })}{' '}
                    (из В в А)
                </option>
            );
        });
    }, [tripsToA]);

    const returnTrips = useMemo(() => {
        return tripsToA
            .filter(
                ({ date }) =>
                    date.getTime() >
                    fromATrip.getTime() + timeSingleMilliseconds
            )
            .map(({ date, index }) => {
                return (
                    <option key={ukey()} value={`B ${index}`}>
                        {date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        })}{' '}
                        (из B в A)
                    </option>
                );
            });
    }, [fromATrip]);

    const calculation = useMemo(() => {
        let ticketEnding = '';
        if (
            (ticketCount >= 10 && ticketCount < 21) ||
            ticketCount.toString().match(/0|[5-9]$/)
        )
            ticketEnding = 'ов';
        else if (ticketCount.toString().match(/[2-4]$/)) ticketEnding = 'а';

        const ticketCost =
            type === Types[2]
                ? ticketCount * priceRound
                : ticketCount * priceSingle;

        const tripTime =
            (type === Types[2]
                ? fromBTrip.getTime() -
                  fromATrip.getTime() +
                  timeSingleMilliseconds
                : timeSingleMilliseconds) / 60000;

        return (
            <div className='break-words p-4 border-2 rounded-2xl border-emerald-600 hover:scale-110 transition-all'>
                <p>
                    Вы выбрали {ticketCount} билет{ticketEnding} по маршруту{' '}
                    {type} стоимостью {ticketCost}р.
                </p>
                <p>Это путешествие займет у вас {tripTime} минут.</p>
                <p>
                    Теплоход отправляется в{' '}
                    {type !== Types[1]
                        ? fromATrip.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                          })
                        : fromBTrip.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                          })}
                    , а прибудет в{' '}
                    {type !== Types[0]
                        ? new Date(
                              fromBTrip.getTime() + timeSingleMilliseconds
                          ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                          })
                        : new Date(
                              fromATrip.getTime() + timeSingleMilliseconds
                          ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                          })}
                </p>
            </div>
        );
    }, [ticketCount, type, fromATrip, fromBTrip]);

    return (
        <div className='h-screen w-screen flex flex-col items-center justify-start pt-4'>
            <div className='flex flex-col w-[320px] gap-2 border-4 p-4 rounded-2xl border-sky-400 text-center'>
                <select
                    className='border-2 rounded-2xl border-sky-300 p-1 transition-all'
                    onChange={onTypeSelect}
                    name='route'
                    id='route'
                >
                    <option value='из A в B'>из A в B</option>
                    <option value='из B в A'>из B в A</option>
                    <option value='из A в B и обратно в А'>
                        из A в B и обратно в А
                    </option>
                </select>
                <label
                    className='rounded-t-2xl bg-sky-500 w-full text-white font-bold uppercase tracking-wider p-2'
                    htmlFor='time'
                >
                    Выберите время
                </label>
                <select
                    onChange={onStartSelect}
                    className='border-2 rounded-2xl border-sky-300 p-1 transition-all'
                    name='time'
                    id='time'
                >
                    {type !== Types[1] && fromATrips}
                    {type === Types[1] && fromBTrips}
                </select>
                {type === Types[2] && (
                    <div className='flex flex-col gap-2'>
                        <label
                            className='rounded-t-2xl bg-sky-500 text-white font-bold uppercase tracking-wider p-2 w-full'
                            htmlFor='time'
                        >
                            Выберите обратное время
                        </label>
                        <select
                            onChange={onStartSelect}
                            className='border-2 rounded-2xl border-sky-300 p-1 transition-all'
                            name='time'
                            id='time'
                        >
                            {returnTrips}
                        </select>
                    </div>
                )}

                <label
                    className='rounded-t-2xl bg-sky-500 text-white font-bold uppercase tracking-wider p-2 w-full'
                    htmlFor='num'
                >
                    Количество билетов
                </label>
                <input
                    value={String(ticketCount)}
                    min={0}
                    onChange={onTicketCountChange}
                    type='number'
                    className='border-2 rounded-2xl border-sky-300 p-1 hover:scale-105 transition-all'
                    id='num'
                />
                <button
                    onClick={onCalculateButtonClick}
                    className='border-2 rounded-2xl border-emerald-600 p-2 bg-emerald-400 transition-all hover:bg-emerald-200 hover:scale-105 hover:text-emerald-600 text-white font-bold uppercase'
                >
                    Посчитать
                </button>

                {showCalculation && calculation}
            </div>
        </div>
    );
}

export default App;
