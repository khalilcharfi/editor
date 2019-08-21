import { isString, isNumber } from "./func";


export function second (fps, timecode) {

    if (isString(timecode)) {
        var [hour, minute, second, frame] = timecode.split(':');

        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);
        second = parseInt(second, 10);
        frame = parseInt(frame, 10);

        return hour * 3600 
             + minute * 60 
             + second 
             + frame * (1/fps);
    } else if ( isNumber(timecode)) {
        return timecode / fps;
    }

    return 0 
}

export function frames (fps, time) {
    return time * fps; 
}

export function timecode(fps, seconds) {
    var h = Math.floor(seconds / 3600)
    var m = Math.floor(seconds/60 % 60);
    var s = Math.floor(seconds % 60);
    var f = Math.round( (seconds - Math.floor(seconds)) * fps );

    return [h, m, s, f].map(t => {
        return (t + '').padStart(2, '0')
    }).join(':')
}

export function timecodeToFrames(fps, timecode, start = null) {
    return frames(fps, second(fps, timecode) - second(fps, start))
}

export function framesToTimecode(fps, frames, start = null) {
    return timecode(fps, second(fps, frames) - second(fps, start));
}

export function makeTimer (opt) {

    var timer = {
        id: 0,
        start: 0, 
        elapsed: 0,
        duration: opt.duration || 0,
        iterationStartCount: 1,
        iterationCount: opt.iterationCount || Number.MAX_SAFE_INTEGER,
        direction: opt.direction || 'normal',
        tick: opt.tick,
        startCallback: opt.start || (() => {}),
        endCallback: opt.end || (() => {}),
        firstCallback: opt.first || (() => {}) ,
        lastCallback: opt.last || (() => {}),
        pause: false
    }

    const isForward = () => {
        if (timer.direction === 'normal') {
            return true
        } else if (timer.direction === 'reverse') {
            return false
        } else if (timer.direction === 'alternate') {
            return timer.iterationStartCount % 2 === 1
        } else if (timer.direction === 'alternate-reverse') {
            return timer.iterationStartCount % 2 === 0
        }
    }


    const calculateForDirection = (rate) => {
        return isForward() ? rate : 1 - rate; 
    }

    const tick = (now) => {

        var isStart = false; 
        if (timer.start === null) {
            timer.start = now; 
            isStart = true; 
        }

        timer.elapsed = now - timer.start + timer.pauseTime;
        // console.log(timer.elapsed);

        if (timer.elapsed > timer.duration) {
            timer.elapsed = timer.duration;
        }
        
        var elapsed = calculateForDirection(timer.elapsed/timer.duration) * timer.duration;
        if (isStart) timer.startCallback(elapsed, timer);
        timer.tick (elapsed, timer);

        if (timer.elapsed === timer.duration) {
            end();
        } else {
            frameStart();
        }
    }

    const frameStart = () => {
        timer.id = requestAnimationFrame(tick);
    }

    const end = () => {
        timer.endCallback(timer.elapsed, timer);
        timer.iterationStartCount++;

        if (timer.iterationStartCount > timer.iterationCount) {
            timer.lastCallback(timer.elapsed, timer);
            cancelAnimationFrame(timer.id);
        } else {
           // 멈추지 않은 상태면 
           timer.start = null;
           frameStart();
        }
    }

    const start = () => {
        timer.start = null;
        timer.pauseTime = 0;         
        timer.iterationStartCount = 1;
        timer.firstCallback(timer.elapsed, timer);
        frameStart();
    }

    const pause = () => {
        timer.pause = true; 
        timer.pauseTime = timer.start; 
        timer.start = null; 

        stop()
    }

    const stop = () => {
        cancelAnimationFrame(timer.id);
    }

    const restart = () => {
        timer.pause = false; 
        timer.start = null;
        frameStart();
    }


    return {
        start, 
        pause,
        stop,
        restart,
        tick,
        timer
    }
}


// var timer = makeTimer({
//     duration: 1000,
//     iterationCount: 3,
//     direction: 'alternate',
//     first: (elapsed, timer) => {
//         console.log('first', elapsed, timer);
//     },
//     last: (elapsed, timer) => {
//         console.log('last', elapsed, timer);
//     },
//     start: (elapsed, timer) => {
//         console.log('start', elapsed, timer);
//     },
//     end : (elapsed, timer) => {
//         console.log('end', elapsed, timer);
//     },
//     tick: (elapsed, timer) => {
        
//         console.log('tick', timecode(60, elapsed / 1000), elapsed, timer.iterationStartCount)
//     }
// })

// timer.start();


// setTimeout( () => {
//     timer.start();
// }, 1000)

/* 

makeTimer({
    duration:  ,
    tick: (elapsed, timer) => {

    }
})

*/