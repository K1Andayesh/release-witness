export function validateDeployment({
  status,
  benchmark,
  expectedVersion,
  expectedCommit,
  expectedArchiveSha256,
}) {
  const failures = [];
  const expectedArchive = expectedArchiveSha256.toLowerCase();
  const expect = (condition, message) => {
    if (!condition) failures.push(message);
  };

  expect(status?.publicDemo === true, "Public demo mode is not active.");
  expect(
    status?.version === expectedVersion,
    "The running version does not match.",
  );
  expect(
    status?.releaseCommit === expectedCommit,
    "The running commit does not match.",
  );
  expect(
    status?.releaseArchiveSha256 === expectedArchive,
    "The running source archive does not match.",
  );
  expect(benchmark?.complete === true, "The benchmark is not certified.");
  expect(
    benchmark?.release?.version === expectedVersion,
    "The benchmark version does not match.",
  );
  expect(
    benchmark?.release?.commit === expectedCommit,
    "The benchmark commit does not match.",
  );
  expect(
    benchmark?.release?.archiveSha256 === expectedArchive,
    "The benchmark source archive does not match.",
  );
  expect(
    /^[a-f0-9]{64}$/.test(benchmark?.attestation?.digest || ""),
    "The benchmark receipt is unavailable.",
  );
  const totals = benchmark?.totals || {};
  expect(
    totals.knownDefects > 0 &&
      totals.defectsDetected === totals.knownDefects &&
      totals.repairsResolved === totals.knownDefects,
    "The controlled defect and repair totals do not verify.",
  );
  expect(totals.regressions === 0, "The benchmark reports a regression.");
  expect(totals.receiptsVerified > 0, "No run receipts verify.");
  expect(totals.screenshotFilesVerified > 0, "No screenshot files verify.");
  expect(totals.modelRunsVerified > 0, "No model runs verify.");
  expect(totals.browserRunsVerified > 0, "No Chrome runs verify.");
  expect(
    Array.isArray(benchmark?.suites) &&
      benchmark.suites.length > 0 &&
      benchmark.suites.every(
        (suite) =>
          suite.verified &&
          suite.modelEvidence?.verified &&
          suite.browserEvidence?.verified,
      ),
    "A workflow evidence chain is incomplete.",
  );

  return {
    ready: failures.length === 0,
    failures,
    summary: {
      version: status?.version || null,
      commit: status?.releaseCommit || null,
      archiveSha256: status?.releaseArchiveSha256 || null,
      benchmarkDigest: benchmark?.attestation?.digest || null,
      workflowsVerified: benchmark?.suites?.filter((suite) => suite.verified)
        .length,
      receiptsVerified: totals.receiptsVerified || 0,
      screenshotFilesVerified: totals.screenshotFilesVerified || 0,
      modelRunsVerified: totals.modelRunsVerified || 0,
      browserRunsVerified: totals.browserRunsVerified || 0,
    },
  };
}
