import test from 'node:test';
import assert from 'node:assert/strict';
import { coachingPolicy, preservesLiterals } from '../scripts/lib/coaching-policy.mjs';
test('on-demand and zero sample rate avoid background requests',()=>{
 assert.equal(coachingPolicy({coaching_mode:'on-demand'},'Please fix my test',{}).enabled,false);
 assert.equal(coachingPolicy({sample_rate:0},'Please fix my test',{}).enabled,false);
 assert.equal(coachingPolicy({coaching_mode:'on-demand'},':: improve this',{}).enabled,true);
});
test('routes gateway explicitly and refuses unsupported provider fallback',()=>{
 assert.equal(coachingPolicy({},'x',{ANTHROPIC_BASE_URL:'https://example.test/v1'}).url,'https://example.test/v1/messages');
 assert.ok(coachingPolicy({},'x',{CLAUDE_CODE_USE_VERTEX:'1'}).error);
 assert.ok(coachingPolicy({},'x',{ANTHROPIC_BASE_URL:'http://example.test'}).error);
 assert.equal(coachingPolicy({},'x',{}).timeout,5);
});

test('coaching preserves code and numeric limits mechanically',()=>{
 assert.equal(preservesLiterals('keep `usr_id` and 250 ms','Keep `usr_id` and 250 ms.'),true);
 assert.equal(preservesLiterals('keep `usr_id` and 250 ms','Keep `user_id` and 250 ms.'),false);
 assert.equal(preservesLiterals('limit 250 ms','limit 500 ms'),false);
});
