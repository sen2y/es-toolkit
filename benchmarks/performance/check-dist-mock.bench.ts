import { bench, describe } from 'vitest';

// Mock tarball creation (실제 tarball 생성 없이 시간만 시뮬레이션)
const mockCreatePackageTarball = () => {
  return new Promise(resolve => {
    // 실제 tarball 생성 시간 시뮬레이션 (23초)
    setTimeout(() => {
      resolve({ path: '/tmp/mock-package.tgz' });
    }, 50); // 실제 테스트를 위해 50ms로 단축
  });
};

// Mock 파일 읽기
const mockProcessTarball = (tarballPath: string) => {
  return new Promise(resolve => {
    // 파일 처리 시간 시뮬레이션 (1초)
    setTimeout(() => {
      resolve({ exports: { '.': {}, './array': {}, './object': {} } });
    }, 10);
  });
};

describe('check-dist performance comparison (mocked)', () => {
  bench('Original approach: Duplicate tarball creation', async () => {
    // 첫 번째 테스트에서 tarball 생성 + 처리
    const tarball1 = await mockCreatePackageTarball();
    await mockProcessTarball(tarball1.path);
    
    // 두 번째 테스트에서 tarball 재생성 + 처리
    const tarball2 = await mockCreatePackageTarball();
    await mockProcessTarball(tarball2.path);
  });

  bench('Optimized approach: Shared tarball creation', async () => {
    // beforeAll에서 한 번만 생성
    const sharedTarball = await mockCreatePackageTarball();
    
    // 첫 번째 테스트에서 재사용
    await mockProcessTarball(sharedTarball.path);
    
    // 두 번째 테스트에서 재사용
    await mockProcessTarball(sharedTarball.path);
  });
});

describe('function call overhead comparison', () => {
  // 실제 함수 호출 패턴 비교
  const createTarball = () => ({ path: '/tmp/test.tgz' });
  const processTarball = (path: string) => ({ exports: {} });

  bench('Original: Function calls with recreation', () => {
    // 매번 새로 생성
    const tarball1 = createTarball();
    processTarball(tarball1.path);
    
    const tarball2 = createTarball();
    processTarball(tarball2.path);
  });

  bench('Optimized: Function calls with reuse', () => {
    // 한 번 생성하고 재사용
    const sharedTarball = createTarball();
    
    processTarball(sharedTarball.path);
    processTarball(sharedTarball.path);
  });
});