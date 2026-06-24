import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReferralPosition } from "@/lib/use-referral-position";

const payload = {
  position: 42,
  baseRank: 47,
  referralCount: 1,
  jumpsPerReferral: 5,
};

const stubFetch = (body: unknown = payload, ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });

// flushMicrotasks lets the awaited fetch/json promises inside tick() settle
// after we advance the fake timers.
const flushMicrotasks = () => act(async () => { await Promise.resolve(); });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useReferralPosition", () => {
  it("does not fetch before the first interval elapses", () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE123456", onUpdate, 8000));

    // No immediate fetch on mount.
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the right URL and calls onUpdate with the payload after the interval", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE 1/2", onUpdate, 8000));

    await act(async () => {
      vi.advanceTimersByTime(8000);
    });
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // code is URL-encoded into the path.
    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist/me/CODE%201%2F2");
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(payload);
  });

  it("polls repeatedly on each interval tick", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE123456", onUpdate, 1000));

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await flushMicrotasks();
    }

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });

  it("clears the interval on unmount (no further fetches)", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    const { unmount } = renderHook(() =>
      useReferralPosition("CODE123456", onUpdate, 1000),
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    await flushMicrotasks();

    // No additional polls after unmount.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does nothing when code is null", () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition(null, onUpdate, 1000));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does nothing when code is undefined", () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition(undefined, onUpdate, 1000));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does nothing when code is the empty string", () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("", onUpdate, 1000));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips onUpdate when the response is not ok", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(payload, false);
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE123456", onUpdate, 1000));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("skips onUpdate when the payload has no numeric position", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch({ error: "not found" });
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE123456", onUpdate, 1000));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("swallows a rejected fetch and keeps polling on the next tick", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network blip"))
      .mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    renderHook(() => useReferralPosition("CODE123456", onUpdate, 1000));

    // First tick rejects; no crash, no onUpdate.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(onUpdate).not.toHaveBeenCalled();

    // Second tick succeeds.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(payload);
  });

  it("always calls the latest onUpdate without re-arming the interval", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);

    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useReferralPosition("CODE123456", cb, 1000),
      { initialProps: { cb: first } },
    );

    rerender({ cb: second });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();

    // Stale callback never invoked; latest one gets the payload.
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(payload);
    // Only one interval ever scheduled despite the re-render.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("restarts polling when the code changes", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onUpdate = vi.fn();

    const { rerender } = renderHook(
      ({ code }) => useReferralPosition(code, onUpdate, 1000),
      { initialProps: { code: "FIRSTCODE0" } },
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/waitlist/me/FIRSTCODE0");

    rerender({ code: "SECONDCDE1" });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/waitlist/me/SECONDCDE1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
